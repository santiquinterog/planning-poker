# Onboarding — datos, prerrequisitos y OAuth

## 1. Recolección de datos (no sensibles)

Pregunta al usuario:

1. Nombre de la **organización** (el `<org>` en `https://dev.azure.com/<org>`).
2. Nombre del **proyecto** dentro de la organización (se usa solo para validar).
3. ¿A qué **cliente(s)** quiere conectar? **Kiro**, **Copilot** y/o **Claude Code** (por defecto,
   los tres).

**Nunca pidas tokens, PATs ni contraseñas.** Este flujo no necesita ninguno.

**STOP y espera los datos del usuario.**

## 2. Prerrequisitos

Verifícalos o pregúntalos:

| Requisito | Por qué | Comprobación |
|---|---|---|
| **Python 3** | Ejecuta el script incluido en `references/configuracion-clientes.md` (dentro de esta skill) | `python3 --version` / `py -3 --version` |
| **Node.js** | El servidor se lanza con `npx` | `npx --version` |
| **Azure CLI** | Provee el token OAuth de Entra ID | `az --version` |
| **Org respaldada por Entra ID** | El método no funciona con orgs standalone/MSA | ver abajo |

Si falta Azure CLI: https://learn.microsoft.com/cli/azure/install-azure-cli

### Organizaciones standalone / MSA

Las organizaciones de Azure DevOps que **no** están respaldadas por un tenant de Microsoft Entra ID
(las llamadas "standalone", asociadas a una cuenta Microsoft personal) **no funcionan** con este
método: el servidor oficial obtiene el token vía Azure CLI, que autentica contra Entra.

Si el usuario está en ese caso, explícaselo y detén el flujo: no existe alternativa oficial sin PAT,
y no debes configurar servidores comunitarios ni pedir un PAT como sustituto.

## 3. Iniciar sesión OAuth

Pide al usuario ejecutar en su terminal:

```bash
az login
```

Se abre el navegador y completa el flujo OAuth de Entra ID.

Si la organización vive en un tenant específico (habitual en empresas con varios tenants):

```bash
az login --tenant <tenant-id>
```

Para comprobar contra qué cuenta y tenant quedó la sesión:

```bash
az account show
```

**No se genera ni se guarda ningún PAT.** El servidor MCP lee los tokens que Azure CLI mantiene en
el perfil del usuario.

## 4. Nota sobre el servidor remoto

Microsoft también ofrece un servidor **remoto** (`https://mcp.dev.azure.com/<org>`), pero hoy los
clientes no-Microsoft (incluido Kiro) **no pueden autenticarse** contra él, porque Entra aún no
soporta el registro dinámico de clientes OAuth (DCR).

Cuando Microsoft lo habilite, ese será el endpoint preferido. Mientras tanto, el método oficial es
el servidor local con `az login` que configura esta skill.

## Siguiente paso

Continúa con `references/configuracion-clientes.md`.
