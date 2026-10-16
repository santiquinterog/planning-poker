# Configuración de clientes

## Por qué Jenkins no usa el transporte remoto directo

Lo natural sería declarar el servidor como remoto (`url` + `headers` con el `Authorization`). **No
funciona.** Kiro —y otros clientes MCP, incluido Claude Code— intentan un **descubrimiento OAuth
automático** contra el servidor (petición a `/register`, *dynamic client registration*) **antes** de
usar la cabecera que ya tienen configurada.

Jenkins no implementa OAuth: solo Basic auth con API token. Ante `/register` devuelve una **página
HTML de error**, no JSON, y el parser del cliente se rompe. El síntoma exacto es:

```text
Failed to connect: HTTP 401: Invalid OAuth error response: SyntaxError:
Unexpected token '<' ... <title>Error 401 Unauthorized</title> ... URI: /register
```

Es un **bug conocido del cliente**, no un error de configuración: la cabecera `Authorization` era
correcta todo el tiempo. No pierdas tiempo revisando el token cuando veas este mensaje.

La solución es declarar el servidor como **`stdio`** y poner
[`mcp-remote`](https://www.npmjs.com/package/mcp-remote) como puente: resuelve la cabecera y hace la
petición HTTP él mismo, sin pasar por el flujo OAuth del cliente. Es lo que hace el script por
defecto (`--mode bridge`).

## Destinos y formatos

| Cliente | Archivo (relativo al workspace) | Clave | Formato del bloque | Sustitución del secreto |
|---|---|---|---|---|
| Kiro | `.kiro/settings/mcp.json` | `mcpServers` | `command`/`args` + `disabled`/`autoApprove` | `${JENKINS_BASIC_AUTH}` |
| GitHub Copilot | `.vscode/mcp.json` | `servers` | `type: "stdio"` + `command`/`args` | `${env:JENKINS_BASIC_AUTH}` |
| Claude Code | `.mcp.json` | `mcpServers` | `type: "stdio"` + `command`/`args` | `${JENKINS_BASIC_AUTH}` |

**Ningún archivo contiene el secreto** — solo la referencia a la variable de entorno, ahora dentro de
`args`. Cada cliente la sustituye al lanzar el proceso. Esto importa porque `.vscode/mcp.json` y
`.mcp.json` suelen versionarse en git.

El bloque resultante es:

```json
{
  "mcpServers": {
    "jenkins": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote@latest",
        "http://localhost:8090/mcp-server/mcp",
        "--header", "Authorization:Basic ${JENKINS_BASIC_AUTH}",
        "--allow-http",
        "--transport", "http-only"
      ],
      "disabled": false,
      "autoApprove": []
    }
  }
}
```

- `--allow-http` solo se añade si la URL es `http://` (típico en Jenkins local). El script lo decide
  por ti según el esquema; con `https://` no aparece.
- `--transport http-only` evita que `mcp-remote` intente un fallback a SSE que Jenkins no expone.
- En `--header`, **no** pongas espacio tras los dos puntos (`Authorization:Basic ...`): con espacio,
  `mcp-remote` parte mal el argumento.

## Procedimiento

El script **está en este mismo archivo**, en la sección [Script](#script) del final. Viaja dentro de
la skill: no se descarga de ningún sitio, se copia desde aquí. Por eso el primer paso es
reconstruirlo en disco antes de ejecutarlo.

Los comandos van en **dos variantes**. Usa la que corresponda al sistema del usuario; en Windows con
**WSL** o **Git Bash** sirve la variante de macOS/Linux. Pregúntaselo si no lo sabes — no lo asumas.

### Antes de nada: explícaselo al usuario

El usuario va a ver que creas un archivo `.py` y lo ejecutas. **Dile qué es antes de hacerlo**, en
una frase, para que no parezca que estás instalando algo en su máquina:

```text
Para dejar configurado el servidor MCP voy a crear un script temporal:

  - Qué hace: escribir el bloque del servidor en los archivos de configuración de tus
    clientes (.kiro/settings/mcp.json, .vscode/mcp.json, .mcp.json), sin borrar los
    servidores que ya tengas.
  - Qué no hace: no toca tu código, no instala dependencias y no envía nada fuera de tu
    equipo.
  - Tu API token: no lo lee ni lo necesita. En la configuración solo escribe una
    referencia a la variable de entorno, nunca el valor.
  - Dónde vive: en una carpeta temporal del sistema, fuera de tu repositorio.
  - Cuánto dura: lo borro en cuanto termine. Existe solo para hacer esta conexión.
```

No hace falta que el usuario apruebe nada ni que responda: es informativo. Pero **no lo omitas** —
crear y ejecutar un script sin avisar es lo que hace que el flujo parezca opaco.

1. Reconstruye el script en un directorio temporal — **no en el repositorio del usuario**. Copia el
   bloque de abajo íntegro, sin reformatear ni "mejorar" nada:

   ```bash
   # macOS / Linux
   mkdir -p /tmp/mcp-setup
   ```

   ```powershell
   # Windows (PowerShell)
   New-Item -ItemType Directory -Force -Path "$env:TEMP\mcp-setup" | Out-Null
   ```

   Escribe el contenido del bloque en `configure_mcp.py` dentro de ese directorio
   (`/tmp/mcp-setup/` o `%TEMP%\mcp-setup\`).

2. Ejecútalo desde la raíz del workspace del usuario:

   ```bash
   # macOS / Linux
   python3 /tmp/mcp-setup/configure_mcp.py --jenkins-url http://localhost:8090 --workspace .
   ```

   ```powershell
   # Windows (PowerShell)
   py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --jenkins-url http://localhost:8090 --workspace .
   ```

   Si `py` no existe en Windows, usa `python`. El script solo necesita la **librería estándar** de
   Python 3.7+, así que no hay nada que instalar.

3. Borra el temporal:

   ```bash
   # macOS / Linux
   rm -rf /tmp/mcp-setup
   ```

   ```powershell
   # Windows (PowerShell)
   Remove-Item -Recurse -Force "$env:TEMP\mcp-setup"
   ```

   No lo conserves entre sesiones: vuelve a reconstruirlo desde esta guía cuando haga falta, así
   nunca trabajas sobre una copia obsoleta.

El script **nunca lee ni imprime** `JENKINS_BASIC_AUTH`: solo escribe la referencia `${...}`. Puedes
ejecutarlo aunque la variable todavía no esté exportada.

### Opciones

| Opción | Efecto |
|---|---|
| `--jenkins-url <URL>` | **Obligatoria.** URL base de Jenkins; se le añade `/mcp-server/mcp`. |
| `--mode bridge\|direct` | `bridge` (por defecto) usa `mcp-remote` como puente stdio. `direct` escribe el bloque remoto `url` + `headers`. **Solo usa `direct` si el cliente no hace descubrimiento OAuth** — en Kiro falla (ver arriba). |
| `--clients kiro,copilot,claude-code` | Limita los destinos. Por defecto escribe en los tres. Acepta alias (`claude`, `cc`, `vscode`, `gh-copilot`). |
| `--workspace .` | Raíz del workspace donde se escriben los archivos. Por defecto, el directorio actual. |
| `--dry-run` | Muestra los bloques que se escribirían, sin escribir nada. **El secreto aparece como variable, nunca resuelto.** |

El script normaliza la URL: quita la barra final y añade `https://` si el usuario dio solo el host
(si escribe `localhost:8090` sin esquema, dile que ponga `http://localhost:8090` explícitamente).

Ejemplos:

```bash
# macOS / Linux
# Jenkins local por HTTP, solo Kiro
python3 /tmp/mcp-setup/configure_mcp.py --jenkins-url http://localhost:8090 --clients kiro --workspace .

# Ver qué haría, sin tocar nada
python3 /tmp/mcp-setup/configure_mcp.py --jenkins-url https://jenkins.mi-empresa.com --workspace . --dry-run
```

```powershell
# Windows (PowerShell)
# Jenkins local por HTTP, solo Kiro
py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --jenkins-url http://localhost:8090 --clients kiro --workspace .

# Ver qué haría, sin tocar nada
py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --jenkins-url https://jenkins.mi-empresa.com --workspace . --dry-run
```

## Por qué siempre el script

Kiro **no permite que el agente edite `mcp.json`**. Para Copilot y Claude Code no existe esa
restricción, pero el script los cubre igual por tres razones:

1. **Merge seguro** — parsea el JSON existente, inserta o reemplaza solo la clave del servidor y
   vuelve a serializar, sin borrar otros servidores del usuario.
2. **Sintaxis del secreto** — cada cliente usa una forma distinta (`${env:...}` en Copilot,
   `${...}` en los otros). Escribirlo a mano es la fuente habitual de 401 silenciosos.
3. **Los flags de `mcp-remote`** — `--allow-http` condicional al esquema, `--transport http-only`, y
   el `--header` sin espacio tras los dos puntos. Los tres se olvidan fácilmente a mano.

Si el archivo existente no es JSON válido, el script aborta con un error explícito en vez de
sobrescribirlo.

## Activar el servidor en cada cliente

Tras escribir la configuración:

- **Kiro** — recarga los servidores solo; si no, panel **MCP Servers** → recargar.
- **GitHub Copilot** — panel MCP → **"Start"** en el servidor `jenkins`.
- **Claude Code** — pedirá **aprobar** el servidor declarado en `.mcp.json` la primera vez.

La primera vez, `npx` descarga `mcp-remote`: el arranque tarda unos segundos más de lo normal. No lo
confundas con un cuelgue.

Si `JENKINS_BASIC_AUTH` no estaba definida cuando arrancó el cliente, la cabecera se enviará sin
resolver y la conexión devolverá **401**. En ese caso: definir la variable de forma permanente,
**reiniciar el cliente** y reintentar.

## Script

```python
#!/usr/bin/env python3
"""
configure_mcp.py — Configura el plugin MCP OFICIAL de Jenkins en Kiro,
GitHub Copilot (VS Code) y/o Claude Code.

Servidor: el plugin oficial `mcp-server` (jenkinsci/mcp-server-plugin),
instalado en el controller de Jenkins, que expone <jenkins-url>/mcp-server/mcp.
Autenticacion: HTTP Basic con usuario + API token de Jenkins (no existe OAuth).

MODO POR DEFECTO: "bridge". Declara el servidor como stdio y usa `mcp-remote`
como puente HTTP. Motivo: los clientes MCP (Kiro, Claude Code) intentan un
descubrimiento OAuth (/register) sobre los servidores declarados con `url`
ANTES de usar la cabecera Authorization. Jenkins no habla OAuth y responde con
HTML, lo que rompe el parser del cliente con un 401 enganoso. El puente evita
por completo ese camino.

El modo "direct" escribe el bloque remoto clasico (url + headers). Solo sirve
para clientes que no hagan ese descubrimiento.

El secreto NUNCA se embebe en la configuracion: se escribe una referencia a la
variable de entorno `JENKINS_BASIC_AUTH` (base64 de "usuario:token") que cada
cliente sustituye al conectar. Generala con:

  macOS / Linux:
    export JENKINS_BASIC_AUTH="$(printf '%s:%s' 'USUARIO' 'API_TOKEN' | base64)"

  Windows (PowerShell):
    $env:JENKINS_BASIC_AUTH = [Convert]::ToBase64String(
        [Text.Encoding]::UTF8.GetBytes("USUARIO:API_TOKEN"))

Escribe —mergeando, sin borrar otros servidores— el bloque en el archivo de cada
cliente elegido:
    kiro         -> .kiro/settings/mcp.json    ${JENKINS_BASIC_AUTH}
    copilot      -> .vscode/mcp.json           ${env:JENKINS_BASIC_AUTH}
    claude-code  -> .mcp.json                  ${JENKINS_BASIC_AUTH}
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

CLIENTS = {
    "kiro": {
        "rel": (".kiro", "settings", "mcp.json"),
        "key": "mcpServers",
        "env": "${%s}",
        "style": "kiro",
    },
    "copilot": {
        "rel": (".vscode", "mcp.json"),
        "key": "servers",
        "env": "${env:%s}",
        "style": "vscode",
    },
    "claude-code": {
        "rel": (".mcp.json",),
        "key": "mcpServers",
        "env": "${%s}",
        "style": "vscode",
    },
}

ALIASES = {
    "claude": "claude-code",
    "claudecode": "claude-code",
    "claude_code": "claude-code",
    "cc": "claude-code",
    "vscode": "copilot",
    "code": "copilot",
    "github-copilot": "copilot",
    "githubcopilot": "copilot",
    "gh-copilot": "copilot",
}

ENV_MARK = re.compile(r"\{\{env:([A-Za-z_][A-Za-z0-9_]*)\}\}")


def parse_clients(value: str | None) -> list[str]:
    if not value:
        return list(CLIENTS)
    out: list[str] = []
    for raw in value.split(","):
        key = ALIASES.get(raw.strip().lower(), raw.strip().lower())
        if key not in CLIENTS:
            sys.exit(f"ERROR: cliente desconocido '{raw}'. Validos: {', '.join(CLIENTS)}")
        if key not in out:
            out.append(key)
    return out


def block_for(spec: dict, client: str) -> dict:
    meta = CLIENTS[client]
    tmpl = meta["env"]

    def sub(value: str) -> str:
        return ENV_MARK.sub(lambda m: tmpl % m.group(1), value)

    if meta["style"] == "kiro":
        if spec["transport"] == "stdio":
            block = {
                "command": spec["command"],
                "args": [sub(a) for a in spec.get("args", [])],
                "env": dict(spec.get("env", {})),
            }
        else:
            block = {"url": sub(spec["url"])}
            if spec.get("headers"):
                block["headers"] = {k: sub(v) for k, v in spec["headers"].items()}
        block["disabled"] = False
        block["autoApprove"] = []
        return block

    if spec["transport"] == "stdio":
        block = {
            "type": "stdio",
            "command": spec["command"],
            "args": [sub(a) for a in spec.get("args", [])],
        }
        if spec.get("env"):
            block["env"] = dict(spec["env"])
    else:
        block = {"type": spec["transport"], "url": sub(spec["url"])}
        if spec.get("headers"):
            block["headers"] = {k: sub(v) for k, v in spec["headers"].items()}
    return block


def merge(path: Path, key: str, name: str, block: dict) -> None:
    if path.exists():
        try:
            data = json.loads(path.read_text(encoding="utf-8") or "{}")
        except json.JSONDecodeError as exc:
            sys.exit(f"ERROR: '{path}' no es un JSON valido ({exc}).")
    else:
        data = {}
    if not isinstance(data, dict):
        sys.exit(f"ERROR: '{path}' no tiene un objeto raiz JSON.")
    data.setdefault(key, {})
    data[key][name] = block
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def build_spec(endpoint: str, mode: str) -> dict:
    # Sin espacio tras los dos puntos: mcp-remote parte mal el argumento si lo hay.
    header = "Authorization:Basic {{env:JENKINS_BASIC_AUTH}}"
    if mode == "direct":
        return {
            "name": "jenkins",
            "transport": "http",
            "url": endpoint,
            "headers": {"Authorization": "Basic {{env:JENKINS_BASIC_AUTH}}"},
        }
    args = ["-y", "mcp-remote@latest", endpoint, "--header", header]
    if endpoint.startswith("http://"):
        # Jenkins local sin TLS: mcp-remote rechaza http:// salvo con este flag.
        args.append("--allow-http")
    args += ["--transport", "http-only"]
    return {
        "name": "jenkins",
        "transport": "stdio",
        "command": "npx",
        "args": args,
    }


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Configura el plugin MCP oficial de Jenkins (Basic auth via variable de entorno)."
    )
    ap.add_argument("--jenkins-url", required=True,
                    help="URL del servidor Jenkins (ej: http://localhost:8090).")
    ap.add_argument("--mode", choices=("bridge", "direct"), default="bridge",
                    help="bridge (por defecto): stdio via mcp-remote, evita el OAuth del cliente. "
                         "direct: bloque remoto url+headers (falla en Kiro).")
    ap.add_argument("--clients", default=None,
                    help="Clientes: kiro,copilot,claude-code (por defecto: todos).")
    ap.add_argument("--workspace", default=".",
                    help="Raiz del workspace (por defecto: directorio actual).")
    ap.add_argument("--dry-run", action="store_true",
                    help="Muestra los bloques que se escribirian, sin escribir.")
    args = ap.parse_args()

    base = args.jenkins_url.strip().rstrip("/")
    if not base.startswith(("http://", "https://")):
        base = f"https://{base}"
    endpoint = f"{base}/mcp-server/mcp"

    spec = build_spec(endpoint, args.mode)

    for client in parse_clients(args.clients):
        path = Path(args.workspace).resolve().joinpath(*CLIENTS[client]["rel"])
        key = CLIENTS[client]["key"]
        block = block_for(spec, client)
        if args.dry_run:
            print(f"[dry-run] {client}: {path}")
            print(json.dumps({key: {spec["name"]: block}}, indent=2, ensure_ascii=False))
        else:
            merge(path, key, spec["name"], block)
            print(f"[escrito] {client}: {path}")

    if not args.dry_run:
        if args.mode == "bridge":
            print("\nModo puente: el servidor arranca `npx mcp-remote` (requiere Node.js).")
            print("La primera vez npx lo descarga y el arranque tarda unos segundos mas.")
        else:
            print("\nModo directo: si el cliente intenta OAuth (/register), fallara con un 401")
            print("enganoso aunque la cabecera sea correcta. Usa --mode bridge.")
        print("\nDefine el secreto en tu entorno (nunca en el chat):")
        if sys.platform == "win32":
            print('  $env:JENKINS_BASIC_AUTH = [Convert]::ToBase64String('
                  '[Text.Encoding]::UTF8.GetBytes("USUARIO:API_TOKEN"))')
        else:
            print("  export JENKINS_BASIC_AUTH=\"$(printf '%s:%s' 'USUARIO' 'API_TOKEN' | base64)\"")
        print("Requiere el plugin 'MCP Server' instalado en el controller de Jenkins.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

## Siguiente paso

Continúa con `references/validacion.md`.
