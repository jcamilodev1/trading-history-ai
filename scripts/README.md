# MetaTrader 5 Sync Worker (Modo Continuo)

Este script sincroniza automáticamente todas las cuentas de MT5 registradas en tu aplicación con tu base de datos Supabase.

## Funcionamiento Automático

El script ahora funciona en un **bucle infinito**:
1.  **Consulta la Base de Datos**: Cada ciclo revisa Supabase para ver qué cuentas tienen credenciales de MT5.
2.  **Detección de Cambios**: Si añades una cuenta nueva en la web, el script la detectará en el siguiente ciclo.
3.  **Sincronización Silenciosa**: Se conecta a cada cuenta, descarga las operaciones nuevas y las sube sin duplicados.

## Instalación

1.  Asegúrate de tener Python 3.x.
2.  Instala las dependencias:
    ```bash
    pip install -r requirements.txt
    ```

## Configuración (.env)

Configura tu archivo `.env` en la raíz con lo siguiente:

```ini
# Configuración de Supabase (Usa el Service Role Key)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_secret_service_role_key

# Intervalo de sincronización (en segundos, por defecto 60)
SYNC_INTERVAL=60
```

## Ejecución

Para iniciar el worker:

```bash
python mt5_sync.py
```

Para detenerlo de forma segura, presiona `Ctrl+C` en la terminal. El script terminará el ciclo actual antes de cerrarse.

## Consejos para Despliegue
- **En tu PC**: Puedes dejar la terminal abierta mientras haces trading.
- **En un VPS**: Es recomendable usar un gestor de procesos como `pm2` para asegurar que el script se reinicie si el servidor falla:
  ```bash
  pm2 start mt5_sync.py --name mt5-worker --interpreter python
  ```
