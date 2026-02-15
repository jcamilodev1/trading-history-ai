import os
import MetaTrader5 as mt5
from supabase import create_client, Client
from dotenv import load_dotenv
import pandas as pd
from datetime import datetime
import time
import signal
import sys

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key to bypass RLS
SYNC_INTERVAL = int(os.getenv("SYNC_INTERVAL", 60)) # Seconds between sync cycles
MT5_TERMINAL_PATH = os.getenv("MT5_TERMINAL_PATH") # Optional: Path to terminal64.exe

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials in .env")
    exit(1)

# Connect to Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Global flag for graceful shutdown
running = True

def signal_handler(sig, frame):
    global running
    print("\nDeteniendo el worker de sincronización...")
    running = False

signal.signal(signal.SIGINT, signal_handler)

def connect_mt5(login, password, server):
    """Connect to a specific MetaTrader 5 account with server auto-discovery"""
    # Ensure MT5 is initialized
    init_params = {}
    if MT5_TERMINAL_PATH:
        init_params["path"] = MT5_TERMINAL_PATH
        
    # We try to initialize with the account directly to skip potential login prompts
    if not mt5.initialize(login=int(login), password=password, server=server, **init_params):
        # If initialization with credentials failed, try basic initialization
        if not mt5.initialize(**init_params):
            err = mt5.last_error()
            print(f"   ✗ initialize() failed for {login}, error code =", err)
            if err[0] == -10005:
                print("      ! TIP: Error de IPC Timeout. Asegúrate de que:")
                print("        1. El terminal de MT5 esté ABIERTO.")
                print("        2. 'Algo Trading' esté habilitado en Herramientas > Opciones > Expert Advisors.")
                print("        3. Si tienes varios terminales o el path es inusual, define MT5_TERMINAL_PATH en tu .env")
            return False

    # List of server name variations to try if the initial one failed
    server_variations = [
        server,
        f"{server}-server",
        f"{server}-Server",
        f"{server}-Real",
        f"{server}-Demo",
        server.replace(" ", "")
    ]
    
    seen = set()
    unique_variations = [v for v in server_variations if not (v in seen or seen.add(v))]

    for s_var in unique_variations:
        if not s_var: continue
        
        # Login with credentials
        authorized = mt5.login(int(login), password=password, server=s_var)
        if authorized:
            if s_var != server:
                print(f"   ✓ Conectado a cuenta #{login} (Servidor auto-detectado: {s_var})")
            else:
                print(f"   ✓ Conectado a cuenta #{login}")
            return True
        else:
            last_error = mt5.last_error()
            if last_error[0] in [-1, -2, -5, 10001, 10002]:
                continue
            else:
                break

    print(f"   ✗ Error al conectar cuenta #{login}: {mt5.last_error()}")
    # We don't shutdown here to avoid closing the terminal for the next account
    return False

def sync_trades_for_account(account_id, user_id):
    """Fetch history and sync trades for a specific account"""
    # Fetch all history deals (last 5 years)
    from_date = datetime(2020, 1, 1)
    to_date = datetime.now()
    deals = mt5.history_deals_get(from_date, to_date)
    
    if deals is None or len(deals) == 0:
        return 0

    df = pd.DataFrame(list(deals), columns=deals[0]._asdict().keys())
    df['time'] = pd.to_datetime(df['time'], unit='s')
    
    trades_data = []
    grouped = df.groupby('position_id')
    
    for position_id, group in grouped:
        if position_id == 0: continue # Skip balance operations
        
        group = group.sort_values('time')
        entry_deal = group.iloc[0]
        exit_deal = group.iloc[-1]
        
        # Check if closed
        is_closed = exit_deal['entry'] == 1 # Entry Out
        
        # Calculate Net PnL (profit + swap + commission)
        total_profit = group['profit'].sum() + group['swap'].sum() + group['commission'].sum()
        
        trade = {
            "account_id": account_id,
            "mt5_position_id": int(position_id),
            "user_id": user_id,
            "symbol": entry_deal['symbol'],
            "direction": "LONG" if entry_deal['type'] == 0 else "SHORT",
            "entry_price": float(entry_deal['price']),
            "exit_price": float(exit_deal['price']) if is_closed else None,
            "size": float(entry_deal['volume']),
            "pnl": float(total_profit) if is_closed else None,
            "status": "CLOSED" if is_closed else "OPEN",
            "created_at": entry_deal['time'].isoformat(),
        }
        trades_data.append(trade)

    if not trades_data:
        return 0

    # Batch upsert
    try:
        supabase.table('trades').upsert(trades_data, on_conflict='account_id, mt5_position_id').execute()
        return len(trades_data)
    except Exception as e:
        print(f"      ! Error en upsert para {account_id}: {e}")
        return 0

def run_sync_cycle():
    print(f"\n[{datetime.now().strftime('%H:%M:%S')}] Iniciando ciclo de sincronización...")
    
    # 1. Fetch all accounts from Supabase that have MT5 credentials
    try:
        response = supabase.table('accounts').select("*").not_.is_('mt5_login', 'null').execute()
        accounts = response.data
    except Exception as e:
        print(f"Error al consultar Supabase: {e}")
        return

    if not accounts:
        print("No se encontraron cuentas configuradas en Supabase.")
        return

    print(f"Sincronizando {len(accounts)} cuentas...")

    try:
        if accounts:
            # We initialize at least once before the loop
            init_params = {}
            if MT5_TERMINAL_PATH:
                init_params["path"] = MT5_TERMINAL_PATH
            mt5.initialize(**init_params)

        for acc in accounts:
            if not running: break
            
            login = acc.get('mt5_login')
            password = acc.get('mt5_password')
            server = acc.get('mt5_server')
            acc_id = acc.get('id')
            user_id = acc.get('user_id')

            if not login or not password or not server:
                continue

            print(f" > Procesando: {acc.get('name')} (#{login})")
            
            if connect_mt5(login, password, server):
                num_synced = sync_trades_for_account(acc_id, user_id)
                print(f"   ✓ Sincronizadas {num_synced} operaciones.")
    finally:
        mt5.shutdown()
        
    print("Ciclo completado.")

def main():
    print("========================================")
    print("MT5 SYNC WORKER - MODO CONTINUO")
    print(f"Intervalo: {SYNC_INTERVAL} segundos")
    print("Presiona Ctrl+C para detener")
    print("========================================")

    while running:
        run_sync_cycle()
        
        # Wait for the next interval, checking the flag frequently
        for _ in range(SYNC_INTERVAL):
            if not running: break
            time.sleep(1)

    print("Worker finalizado correctamente.")

if __name__ == "__main__":
    main()
