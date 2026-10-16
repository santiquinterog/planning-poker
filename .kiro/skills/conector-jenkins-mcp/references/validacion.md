# Validación y resolución de errores

## Llamada de validación (solo lectura)

Valida con **una llamada barata de solo lectura**. El prefijo exacto de las herramientas puede
variar según cómo el cliente nombre el servidor:

- Lista los jobs/items del plugin, o consulta el estado de un job conocido. Verifica que responda
  sin error de autenticación.

**No modifiques nada en Jenkins**: nada de lanzar builds, cancelar ejecuciones ni tocar
configuración de jobs.

## Diagnóstico sin filtrar el secreto

Al diagnosticar, **nunca imprimas ni pidas el valor de `JENKINS_BASIC_AUTH`**. Para comprobar que
existe en el entorno basta con:

```bash
# macOS / Linux
[ -n "$JENKINS_BASIC_AUTH" ] && echo definida || echo "NO definida"
```

```powershell
# Windows (PowerShell)
if ($env:JENKINS_BASIC_AUTH) { "definida" } else { "NO definida" }
```

Si necesitas confirmar que el base64 está bien formado, que lo haga el usuario en su terminal — y
que compare solo el **usuario**, nunca el token:

```bash
# macOS / Linux
printf '%s' "$JENKINS_BASIC_AUTH" | base64 --decode | cut -d: -f1
```

```powershell
# Windows (PowerShell)
[Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($env:JENKINS_BASIC_AUTH)).Split(':')[0]
```

## Aislar el problema: cliente vs servidor

Cuando algo falle, separa **el servidor** (Jenkins + plugin + credencial) del **cliente** (Kiro y su
manejo de MCP). El `curl` de la comprobación B en `references/onboarding.md` habla directamente con
el endpoint:

- **Responde `serverInfo` →** el servidor está bien. El problema es del cliente: casi siempre el
  descubrimiento OAuth (ver la primera fila de la tabla). Solución: modo puente.
- **Devuelve 404 →** el plugin no está instalado o la URL base es otra.
- **Devuelve 401 con JSON/texto plano →** la credencial es incorrecta.

Haz esto **antes** de tocar el token: ahorra la mayor parte del diagnóstico.

## Si la validación falla

1. Reporta el **error literal** (no lo resumas) y sugiere la causa más probable:

   | Síntoma | Causa probable | Arreglo |
   |---|---|---|
   | *401 con HTML y `URI: /register`* | **Bug del cliente, no tu configuración.** El cliente intentó descubrimiento OAuth antes de usar la cabecera; Jenkins no habla OAuth y responde HTML | Usar el modo puente (`--mode bridge`, el de por defecto). No toques el token: era correcto |
   | *401 / 403* | API token inválido o revocado | Regenerar el token y reexportar la variable |
   | *401 / 403* | Base64 mal calculado (típico: `echo` en vez de `printf`) | Recalcular con `printf '%s:%s' usuario token \| base64` |
   | *401 / 403* | `JENKINS_BASIC_AUTH` no disponible en el entorno del cliente | Exportarla en el perfil de shell y **reiniciar el cliente** |
   | *404 en `/mcp-server/mcp`* | El plugin MCP Server no está instalado — **confírmalo tú**, no por lo que diga el usuario | Comprobación A/B de `onboarding.md`; escalar con el administrador |
   | *404 en `/mcp-server/mcp`* | La URL base es incorrecta | Corregir `--jenkins-url` y reejecutar |
   | *El servidor no aparece* | El bloque no se escribió | Reejecutar el script; `--dry-run` para inspeccionar |
   | *Timeout / red* | VPN o proxy corporativo | Conectar la VPN o configurar el proxy |

2. Revisa el **log del servidor** en el panel MCP del cliente.
3. Corrige y **reintenta la validación**.
4. **Tras 2 reintentos fallidos:** deja por escrito el último error y los pasos ya verificados, y
   recomienda escalarlo con el administrador de Jenkins. No sigas probando variantes.

## Cierre

Entrega un resumen con:

- En qué **cliente(s) y archivo(s)** quedó configurado el servidor.
- Qué llamada de validación se ejecutó y su resultado.
- Recordatorios de seguridad:
  - El secreto vive en la variable de entorno `JENKINS_BASIC_AUTH`, **nunca** en los archivos de
    configuración ni en el chat.
  - Los API tokens pueden revocarse. Si en el futuro aparece un 401: regenerar el token en
    `<jenkins-url>/me/configure`, volver a exportar la variable y **reiniciar el cliente**.
  - Al rotar el token no hace falta reejecutar el script: la configuración apunta a la variable, no
    al valor.

**Aquí termina el alcance de esta skill.** No continúes con otros flujos salvo petición explícita.
