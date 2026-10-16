# Onboarding — plugin, API token y variable de entorno

## 1. Recolección de datos (no sensibles)

Pregunta al usuario:

1. **URL del servidor Jenkins** (ej: `https://jenkins.mi-empresa.com`).
2. ¿A qué **cliente(s)** quiere conectar? **Kiro**, **Copilot** y/o **Claude Code** (por defecto,
   los tres).
3. ¿Está instalado el plugin **MCP Server** en el controller?

**Nunca pidas al usuario que pegue el API token o el base64 en el chat.**

**STOP y espera los datos del usuario.**

## 2. El plugin en el controller — verifícalo, no lo preguntes

El endpoint MCP lo aporta el plugin oficial `mcp-server`, que debe estar instalado **en el
controller de Jenkins** por un administrador:

> *Manage Jenkins → Plugins → Available plugins → "MCP Server"*

Expone el endpoint en `<jenkins-url>/mcp-server/mcp`.

> ⚠ **No te fíes de un "sí" del usuario.** Es un fallo observado en la práctica: el usuario responde
> que el plugin está instalado, no lo está, y el diagnóstico se va detrás de un 404 durante toda la
> sesión. **Compruébalo tú** con una de las dos llamadas de abajo antes de configurar nada.

**Comprobación A — listar plugins** (necesita `JENKINS_BASIC_AUTH` ya definida):

```bash
# macOS / Linux
curl -s -H "Authorization: Basic $JENKINS_BASIC_AUTH" \
  "http://localhost:8090/pluginManager/api/json?depth=1" | grep -o '"shortName":"mcp-server"' || echo "NO instalado"
```

```powershell
# Windows (PowerShell)
$r = Invoke-RestMethod -Headers @{Authorization="Basic $env:JENKINS_BASIC_AUTH"} `
  "http://localhost:8090/pluginManager/api/json?depth=1"
if ($r.plugins.shortName -contains "mcp-server") { "instalado" } else { "NO instalado" }
```

Si la lista de plugins vuelve **vacía**, trátalo como "no instalado": es exactamente lo que se ve
cuando el plugin falta.

**Comprobación B — hablar con el endpoint** (la definitiva: valida plugin, URL y credencial a la vez):

```bash
# macOS / Linux
curl -s -X POST "http://localhost:8090/mcp-server/mcp" \
  -H "Authorization: Basic $JENKINS_BASIC_AUTH" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-03-26","capabilities":{},"clientInfo":{"name":"probe","version":"0"}}}'
```

Una respuesta correcta trae `"serverInfo":{"name":"Jenkins MCP Server Plugin", ...}`. Si devuelve
**404**, el plugin no está instalado (o la URL base es otra).

**Si no está instalado → detén el flujo** hasta que un administrador lo instale. Sin el plugin no
hay endpoint MCP oficial, y no debes configurar servidores comunitarios como sustituto.

### Prerrequisitos

| Requisito | Por qué | Comprobación |
|---|---|---|
| **Python 3** | Ejecuta el script incluido en `references/configuracion-clientes.md` (dentro de esta skill) | `python3 --version` / `py -3 --version` |
| **Node.js** | El servidor arranca vía `npx mcp-remote` (puente stdio) | `npx --version` |
| **Plugin MCP Server** | Aporta el endpoint `/mcp-server/mcp` | Comprobación A o B, arriba |

## 3. Autenticación: API token (no existe OAuth)

Jenkins no ofrece OAuth para su servidor MCP: el plugin usa la misma autenticación que el propio
Jenkins — **HTTP Basic con usuario + API token**.

Para que el secreto **no quede escrito en ningún archivo de configuración** (los de Copilot y Claude
Code suelen versionarse en git), la cabecera `Authorization` referencia la variable de entorno
`JENKINS_BASIC_AUTH`, que cada cliente sustituye al conectar:

| Cliente | Sintaxis de sustitución |
|---|---|
| Kiro | `${JENKINS_BASIC_AUTH}` |
| Claude Code | `${JENKINS_BASIC_AUTH}` |
| GitHub Copilot (VS Code) | `${env:JENKINS_BASIC_AUTH}` |

El script escribe la sintaxis correcta por cliente; tú solo guías la exportación de la variable.

## 4. Generar el API token

El usuario lo genera en:

> `<jenkins-url>/me/configure` → **"API Token"** → **"Add new Token"**

Jenkins muestra el token **una sola vez**: hay que copiarlo en ese momento. Si se pierde, se genera
otro y se revoca el anterior.

**No lo pegue en el chat.**

## 5. Exportar la credencial como variable de entorno

El valor de `JENKINS_BASIC_AUTH` es el **base64 de `usuario:token`** — no el token en claro. Es lo
que espera la cabecera `Authorization: Basic ...`:

```bash
export JENKINS_BASIC_AUTH="$(printf '%s:%s' 'TU_USUARIO' 'TU_API_TOKEN' | base64)"
```

`printf` en vez de `echo` es deliberado: `echo` añade un salto de línea que se codificaría dentro
del base64 y provocaría un 401.

Para que persista y el cliente la vea, hay que fijarla de forma permanente y **reiniciar el cliente**
(o la terminal desde la que se lanza). Los IDEs heredan el entorno del proceso que los arranca: una
variable definida solo en una terminal suelta no les llega.

- **macOS / Linux** — añadir el `export` al perfil de shell (`~/.zshrc`, `~/.bashrc`, etc.).
- **Windows** — añadir la asignación `$env:...` al perfil de PowerShell (`$PROFILE`), o fijarla a
  nivel de usuario con `setx JENKINS_BASIC_AUTH "<valor>"`. `setx` no afecta a la consola abierta:
  hay que abrir una nueva.

```text
💾 Exporta JENKINS_BASIC_AUTH en tu entorno (no lo pegues en el chat).
¿Ya lo exportaste? (sí/no)
```

**STOP y espera la confirmación del usuario.**

## Siguiente paso

Continúa con `references/configuracion-clientes.md`.
