# Configuración de clientes

## Destinos y formatos

El script traduce un mismo servidor al formato de cada cliente y lo **mergea** en su archivo, sin
borrar los servidores que ya estuvieran configurados:

| Cliente | Archivo (relativo al workspace) | Clave | Formato del bloque |
|---|---|---|---|
| Kiro | `.kiro/settings/mcp.json` | `mcpServers` | `command`/`args`/`env` + `disabled`/`autoApprove` |
| GitHub Copilot | `.vscode/mcp.json` | `servers` | `type: "stdio"` + `command`/`args` |
| Claude Code | `.mcp.json` | `mcpServers` | `type: "stdio"` + `command`/`args` |

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
   python3 /tmp/mcp-setup/configure_mcp.py --org <ORGANIZACION> --workspace .
   ```

   ```powershell
   # Windows (PowerShell)
   py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --org <ORGANIZACION> --workspace .
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

### Opciones

| Opción | Efecto |
|---|---|
| `--org <ORG>` | **Obligatoria.** La organización; se pasa como argumento posicional a `npx -y @azure-devops/mcp <org>`. |
| `--clients kiro,copilot,claude-code` | Limita los destinos. Por defecto escribe en los tres. Acepta alias (`claude`, `cc`, `vscode`, `gh-copilot`). |
| `--workspace .` | Raíz del workspace donde se escriben los archivos. Por defecto, el directorio actual. |
| `--dry-run` | Muestra los bloques que se escribirían, sin escribir nada. |

Ejemplos:

```bash
# macOS / Linux
# Solo Kiro
python3 /tmp/mcp-setup/configure_mcp.py --org contoso --clients kiro --workspace .

# Ver qué haría, sin tocar nada
python3 /tmp/mcp-setup/configure_mcp.py --org contoso --workspace . --dry-run
```

```powershell
# Windows (PowerShell)
# Solo Kiro
py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --org contoso --clients kiro --workspace .

# Ver qué haría, sin tocar nada
py -3 "$env:TEMP\mcp-setup\configure_mcp.py" --org contoso --workspace . --dry-run
```

## Por qué siempre el script

Kiro **no permite que el agente edite `mcp.json`**. El script existe para que la escritura sea
programática y determinista: parsea el JSON existente, inserta o reemplaza solo la clave del
servidor y vuelve a serializar. Editar el archivo a mano arriesga borrar otros servidores del
usuario o dejar un JSON inválido.

Si el archivo existente no es JSON válido, el script aborta con un error explícito en vez de
sobrescribirlo.

## Activar el servidor en cada cliente

Tras escribir la configuración:

- **Kiro** — recarga los servidores solo; si no, panel **MCP Servers** → recargar.
- **GitHub Copilot** — panel MCP → **"Start"** en el servidor `azure-devops`.
- **Claude Code** — pedirá **aprobar** el servidor declarado en `.mcp.json` la primera vez.

Comprueba que `npx` y `az` estén en el **PATH del sistema**, no solo en el shell interactivo: los
IDEs lanzan el proceso con el entorno heredado de la sesión gráfica.

- **macOS / Linux** — lo que añade `~/.zshrc` o `~/.bashrc` puede no llegar a la app.
- **Windows** — comprueba el PATH de usuario (*Variables de entorno*) y reinicia el IDE; `where npx`
  y `where az` deben resolver desde una consola nueva.

## Script

```python
#!/usr/bin/env python3
"""
configure_mcp.py — Configura el servidor MCP OFICIAL de Azure DevOps en Kiro,
GitHub Copilot (VS Code) y/o Claude Code.

Servidor: @azure-devops/mcp (Microsoft). Autenticacion: Microsoft Entra ID via
OAuth con Azure CLI (`az login`). No requiere PAT ni ningun secreto.

Escribe —mergeando, sin borrar otros servidores— el bloque en el archivo de cada
cliente elegido:
    kiro         -> .kiro/settings/mcp.json    clave "mcpServers"
    copilot      -> .vscode/mcp.json           clave "servers"
    claude-code  -> .mcp.json                  clave "mcpServers"

Secretos en cabeceras: se marcan como {{env:NOMBRE}} en el spec y cada cliente
los traduce a su sintaxis de sustitucion (nunca se embebe el valor):
    Kiro / Claude Code -> ${NOMBRE}        Copilot (VS Code) -> ${env:NOMBRE}
Este servidor no usa ninguno, pero el mecanismo se mantiene por uniformidad.
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
                "args": list(spec.get("args", [])),
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
            "args": list(spec.get("args", [])),
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


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Configura el servidor MCP oficial de Azure DevOps (OAuth via az login)."
    )
    ap.add_argument("--org", required=True,
                    help="Organizacion (el <org> en https://dev.azure.com/<org>).")
    ap.add_argument("--clients", default=None,
                    help="Clientes: kiro,copilot,claude-code (por defecto: todos).")
    ap.add_argument("--workspace", default=".",
                    help="Raiz del workspace (por defecto: directorio actual).")
    ap.add_argument("--dry-run", action="store_true",
                    help="Muestra los bloques que se escribirian, sin escribir.")
    args = ap.parse_args()

    spec = {
        "name": "azure-devops",
        "transport": "stdio",
        "command": "npx",
        "args": ["-y", "@azure-devops/mcp", args.org.strip()],
        "env": {},
    }

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
        print("\nRecuerda `az login` (OAuth de Entra ID) antes de usar el servidor.")
        print("Recarga/activa los servidores MCP en cada cliente si no lo hacen solos.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

## Siguiente paso

Continúa con `references/validacion.md`.
