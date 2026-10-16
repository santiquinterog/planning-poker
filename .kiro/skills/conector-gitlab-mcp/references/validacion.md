# Validación y resolución de errores

## Llamada de validación (solo lectura)

Valida con **una llamada barata de solo lectura**. El prefijo exacto de las herramientas puede
variar según cómo el cliente nombre el servidor:

- Obtén el proyecto configurado (ej: `get_project`) o búscalo por nombre. Verifica que responda con
  el proyecto correcto.

**No modifiques nada en GitLab**: nada de crear issues, ramas ni comentarios en merge requests.

## Si la validación falla

1. Reporta el **error literal** (no lo resumas) y sugiere la causa más probable:

   | Síntoma | Causa probable | Arreglo |
   |---|---|---|
   | *401 / 403* | El flujo OAuth no se completó | Reconectar el servidor y repetir la autorización |
   | *401 / 403* | La autorización fue revocada o caducó | Reconectar y reautorizar en el navegador |
   | *404 en `/api/v4/mcp`* | La instancia es anterior a GitLab 18.3 | Escalar: el administrador debe actualizar |
   | *404 en `/api/v4/mcp`* | El *feature flag* del servidor MCP está deshabilitado | Escalar con el administrador |
   | *El servidor no aparece* | El bloque no se escribió | Reejecutar el script; `--dry-run` para inspeccionar |
   | *Timeout / red* | VPN o proxy corporativo para llegar a la instancia self-hosted | Conectar la VPN o configurar el proxy |

2. Revisa el **log del servidor** en el panel MCP del cliente.
3. Corrige y **reintenta la validación**.
4. **Tras 2 reintentos fallidos:** deja por escrito el último error y los pasos ya verificados, y
   recomienda escalarlo con el administrador de la instancia. No sigas probando variantes.

## Cierre

Entrega un resumen con:

- Qué servidor quedó configurado y **en qué archivo de cada cliente**.
- Qué llamada de validación se ejecutó y su resultado.
- Recordatorio: la autorización OAuth puede **revocarse o caducar**. Si en el futuro aparece un 401,
  se reconecta el servidor y se repite la autorización en el navegador — **no hay tokens que rotar**.

**Aquí termina el alcance de esta skill.** No continúes con otros flujos salvo petición explícita.
