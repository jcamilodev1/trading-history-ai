# Plataforma SaaS para Traders

## Diario Inteligente + Detector de Overtrading + Simulador Prop Firm

------------------------------------------------------------------------

# 1. Visión del Producto

## Objetivo

Crear una plataforma web que permita a traders:

-   Registrar y analizar operaciones
-   Detectar patrones psicológicos negativos
-   Gestionar riesgo profesionalmente
-   Simular reglas de Prop Firms

------------------------------------------------------------------------

# 2. Alcance del MVP (Versión 1.0)

Incluye:

-   Registro manual de trades
-   Estadísticas automáticas
-   Detector de sobreoperación
-   Simulación de reglas de cuenta
-   Dashboard consolidado

No incluye:

-   Integración automática con MT5
-   IA avanzada
-   Backtesting histórico masivo

------------------------------------------------------------------------

# 3. Módulos del Sistema

1.  Gestión de Usuarios
2.  Diario de Trading
3.  Motor de Análisis Estadístico
4.  Motor de Psicología / Overtrading
5.  Simulador Prop Firm
6.  Dashboard General

------------------------------------------------------------------------

# 4. Historias de Usuario

## HU-01: Registrar trade manualmente

Como trader\
Quiero registrar una operación\
Para analizar mi rendimiento

Criterios de aceptación: - Activo - Fecha - Hora - Tipo (Buy/Sell) -
Entrada - SL - TP - Resultado en USD - Resultado en R - Lote - Sesión -
Estrategia - Estado emocional - Cálculo automático de RR y riesgo %

------------------------------------------------------------------------

## HU-02: Ver historial de operaciones

Como trader\
Quiero visualizar todas mis operaciones\
Para revisar mi desempeño

Criterios: - Filtro por fecha, activo, sesión, estrategia - Ordenable -
Paginación

------------------------------------------------------------------------

## HU-03: Ver estadísticas generales

Como trader\
Quiero ver estadísticas automáticas\
Para identificar patrones

Métricas: - Winrate total - Winrate por sesión - RR promedio - Profit
factor - Máxima racha pérdida - Máxima racha ganadora

------------------------------------------------------------------------

## HU-04: Detectar patrones negativos

Como trader\
Quiero que el sistema detecte comportamientos dañinos\
Para corregirlos

Reglas: - Pérdida consecutiva + aumento de lotaje → alerta - Operar
fuera horario → alerta - Más de 3 trades en 1 hora → alerta

------------------------------------------------------------------------

## HU-05: Alerta de sobreoperación

Como trader\
Quiero recibir alerta cuando esté operando emocionalmente\
Para evitar pérdidas impulsivas

Criterios: - \>3 trades en 60 minutos - Lote mayor al promedio tras
pérdida - Trade fuera del plan

Mensaje: ⚠️ "Estás operando emocionalmente"

------------------------------------------------------------------------

## HU-06: Score psicológico diario

Score = 100 - penalizaciones

Penalizaciones: - Operar fuera horario - Aumentar riesgo tras pérdida -
Romper plan

------------------------------------------------------------------------

## HU-07: Configurar cuenta simulada

Campos: - Balance inicial - Profit target - Max daily loss - Max total
drawdown

------------------------------------------------------------------------

## HU-08: Estado de cuenta en tiempo real

Mostrar: - % restante daily loss - % restante total DD - Estado SAFE /
WARNING / DANGER

------------------------------------------------------------------------

## HU-09: Simular ruptura de reglas

Ejemplo: "Si pierdes \$250 adicionales, rompes el daily loss."

------------------------------------------------------------------------

# 5. Requerimientos Funcionales

RF-01: Autenticación segura\
RF-02: Aislamiento de datos por usuario\
RF-03: Cálculo automático de métricas\
RF-04: Motor de detección tras cada trade\
RF-05: Soporte múltiples cuentas\
RF-06: Configuración de horarios válidos

------------------------------------------------------------------------

# 6. Requerimientos No Funcionales

RNF-01: Tiempo de respuesta \< 500ms\
RNF-02: Base de datos relacional (PostgreSQL)\
RNF-03: Seguridad JWT\
RNF-04: Docker-ready\
RNF-05: Responsive

------------------------------------------------------------------------

# 7. Modelo de Datos Inicial

## User

-   id
-   email
-   password_hash

## Account

-   id
-   user_id
-   balance
-   max_daily_loss
-   max_drawdown
-   profit_target

## Trade

-   id
-   account_id
-   asset
-   date
-   entry
-   sl
-   tp
-   lot
-   result_usd
-   result_r
-   session
-   strategy
-   emotion

## PsychologyEvent

-   id
-   trade_id
-   type
-   severity

------------------------------------------------------------------------

# 8. Roadmap

## Fase 1

-   Auth
-   CRUD trades
-   Estadísticas básicas

## Fase 2

-   Motor overtrading
-   Score psicológico

## Fase 3

-   Simulador Prop Firm
-   Dashboard avanzado

------------------------------------------------------------------------

Documento generado para planificación SaaS profesional.
