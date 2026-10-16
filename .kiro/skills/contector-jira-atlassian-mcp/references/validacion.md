# Validación y resolución de errores

## Llamada de validación (solo lectura)

Valida con **una llamada barata de solo lectura**. El prefijo exacto de las herramientas puede
variar según cómo el cliente nombre el servidor:

- Obtén el **usuario actual**, o busca incidencias con un JQL simple limitado a 1 resultado:

  ```text
  project = <CLAVE> ORDER BY created DESC
  ```

Verifica que responda sin error de autenticación y que el proyecto del usuario sea visible.

**No modifiques nada en Jira**: nada de crear incidencias, transicionar estados ni comentar.

## Si la validación falla

1. Reporta el **error literal** (no lo resumas) y sugiere la causa más probable:

   | Síntoma | Causa probable | Arreglo |
   |---|---|---|
   | *401 / 403* | El flujo OAuth no se completó | Reconectar el servidor y repetir la autorización |
   | *401 / 403* | Se autorizó **otro sitio** de Atlassian | Reconectar y reautorizar eligiendo el sitio correcto |
   | *401 / 403* | La autorización fue revocada o caducó | Reconectar y reautorizar en el navegador |
   | *Proyecto no visible* | La cuenta autorizada no tiene permisos sobre ese proyecto | Verificar con el administrador del sitio |
   | *El servidor no aparece* | El bloque no se escribió | Reejecutar el script; `--dry-run` para inspeccionar |
   | *Timeout / red* | Proxy corporativo bloqueando `mcp.atlassian.com` | Configurar el proxy o pedir excepción |

   El MCP **respeta los permisos de Jira**: si el usuario no ve el proyecto en la web, tampoco lo
   verá aquí. Antes de tratarlo como fallo de conexión, pídele que lo abra en el navegador.

2. Revisa el **log del servidor** en el panel MCP del cliente.
3. Corrige y **reintenta la validación**.
4. **Tras 2 reintentos fallidos:** deja por escrito el último error y los pasos ya verificados, y
   recomienda escalarlo con el administrador del sitio de Atlassian. No sigas probando variantes.

## Cierre

Entrega un resumen con:

- Qué servidor quedó configurado y **en qué archivo de cada cliente**.
- Qué llamada de validación se ejecutó y su resultado.
- Recordatorio: la autorización OAuth puede **revocarse o caducar**. Si en el futuro aparece un 401,
  se reconecta el servidor y se repite la autorización en el navegador — **no hay tokens que rotar**.

**Aquí termina el alcance de esta skill.** No continúes con otros flujos salvo petición explícita.
