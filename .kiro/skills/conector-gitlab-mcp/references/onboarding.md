# Onboarding — datos, versión de la instancia y OAuth

## 1. Recolección de datos (no sensibles)

Pregunta al usuario:

1. **URL de la instancia**: `https://gitlab.com` o la URL de su GitLab self-hosted.
2. **Ruta o ID del proyecto** (ej: `mi-grupo/mi-proyecto`, o el ID numérico) — se usa solo para
   validar.
3. ¿A qué **cliente(s)** quiere conectar? **Kiro**, **Copilot** y/o **Claude Code** (por defecto,
   los tres).

**Nunca pidas tokens, PATs ni contraseñas.** Este flujo no necesita ninguno.

**STOP y espera los datos del usuario.**

## 2. Prerrequisitos

| Requisito | Por qué | Comprobación |
|---|---|---|
| **Python 3** | Ejecuta el script incluido en `references/configuracion-clientes.md` (dentro de esta skill) | `python3 --version` / `py -3 --version` |
| **GitLab ≥ 18.3** (solo self-hosted) | Antes no existe el endpoint `/api/v4/mcp` | ver abajo |

`gitlab.com` siempre cumple la versión mínima.

### Comprobar la versión de una instancia self-hosted

La versión aparece en **Ayuda → Acerca de GitLab**, o en el endpoint público:

```bash
# macOS / Linux
curl -s https://gitlab.mi-empresa.com/api/v4/version
```

```powershell
# Windows (PowerShell)
Invoke-RestMethod https://gitlab.mi-empresa.com/api/v4/version
```

(Ese endpoint requiere autenticación en muchas instancias; si no responde, pregunta al usuario o a
su administrador.)

El servidor MCP integrado es **experimental desde 18.3** y **beta desde 18.6**. En algunas
instancias está detrás de un *feature flag* que el administrador debe habilitar.

### Si la instancia es anterior a 18.3

Informa al usuario de que su administrador debe actualizar GitLab y **detén el flujo**. No hay
alternativa oficial sin token: **no** configures servidores MCP comunitarios ni pidas un Personal
Access Token como sustituto.

## 3. Autenticación: OAuth 2.0 con DCR

GitLab expone el servidor en `https://<instancia>/api/v4/mcp` y usa **OAuth 2.0 con registro
dinámico de clientes (DCR)**.

Consecuencias prácticas:

- **No hay que registrar ninguna aplicación OAuth** en GitLab: el cliente se registra solo la
  primera vez.
- **No se crea ningún Personal Access Token** ni se guarda ningún secreto en archivos.
- El flujo lo dispara **el cliente al activar el servidor**, no un comando previo. Por eso en esta
  skill la configuración va antes que la autorización.
- Las herramientas respetan los permisos que el usuario ya tiene en GitLab: el MCP no concede
  acceso adicional.

Cuando llegue el momento (tras escribir la configuración), el cliente abrirá el navegador y el
usuario autorizará con su cuenta de GitLab.

## Siguiente paso

Continúa con `references/configuracion-clientes.md`.
