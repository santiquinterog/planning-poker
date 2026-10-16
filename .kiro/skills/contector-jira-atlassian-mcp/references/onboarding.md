# Onboarding — Cloud vs Server, datos y OAuth 2.1

## 1. Descartar Server / Data Center — primero

Antes que nada, pregunta:

> ¿Es Jira **Cloud** (`https://<dominio>.atlassian.net`) o **Server / Data Center**?

- **Server / DC → STOP.** El servidor MCP oficial de Atlassian **no soporta** Server ni Data
  Center. Explícaselo al usuario y **termina el flujo**. No configures servidores comunitarios ni
  pidas un API token como sustituto.
- **Cloud →** continúa.

Señales de que es Cloud: la URL termina en `.atlassian.net`, o el usuario entra desde
`id.atlassian.com`. Una URL con dominio propio (`jira.mi-empresa.com`) suele indicar Server/DC,
pero **no siempre** — Cloud admite dominios personalizados. Ante la duda, pregunta explícitamente.

## 2. Recolección de datos (no sensibles)

Pregunta al usuario:

1. **URL del sitio** (ej: `https://mi-dominio.atlassian.net`) — solo para la validación posterior.
2. **Clave o nombre de un proyecto** que el usuario pueda ver (para validar).
3. ¿A qué **cliente(s)** quiere conectar? **Kiro**, **Copilot** y/o **Claude Code** (por defecto,
   los tres).

**Nunca pidas tokens, API tokens ni contraseñas.** Este flujo no necesita ninguno.

**STOP y espera los datos del usuario.**

## 3. Prerrequisitos

| Requisito | Por qué | Comprobación |
|---|---|---|
| **Python 3** | Ejecuta el script incluido en `references/configuracion-clientes.md` (dentro de esta skill) | `python3 --version` / `py -3 --version` |

No hace falta nada más: el servidor es remoto y lo aloja Atlassian.

## 4. Autenticación: OAuth 2.1

Atlassian aloja el servidor en `https://mcp.atlassian.com/v1/sse` (transporte SSE).

Consecuencias prácticas:

- **No se crea ningún API token** ni se guarda ningún secreto en archivos.
- El flujo lo dispara **el cliente al activar el servidor**, no un comando previo.
- Las herramientas respetan los permisos que el usuario ya tiene en Jira: el MCP no concede acceso
  adicional.

### ⚠ Elegir el sitio correcto

Es el paso que más se falla. Si la cuenta de Atlassian tiene acceso a **varios sitios**, la pantalla
de autorización pide elegir a cuál se concede acceso. Si el usuario elige el sitio equivocado:

- La conexión se establece **sin error**.
- Pero el proyecto que quería consultar **no aparece**, o las llamadas devuelven 403.

Recuérdaselo explícitamente antes de que autorice, e indícale la URL del sitio que te dio en el
paso 2.

## Siguiente paso

Continúa con `references/configuracion-clientes.md`.
