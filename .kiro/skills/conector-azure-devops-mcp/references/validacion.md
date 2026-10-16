# Validación y resolución de errores

## Llamada de validación (solo lectura)

Valida con **una llamada barata de solo lectura**. El prefijo exacto de las herramientas puede
variar según cómo el cliente nombre el servidor:

- Lista los proyectos de la organización (ej: `core_list_projects`) y verifica que el proyecto
  indicado por el usuario aparezca en la respuesta.

**No modifiques nada en Azure DevOps**: nada de crear work items, ramas ni comentarios.

## Si la validación falla

1. Reporta el **error literal** (no lo resumas) y sugiere la causa más probable:

   | Síntoma | Causa probable | Arreglo |
   |---|---|---|
   | *401 / 403* | Sesión de Azure CLI expirada | Repetir `az login` |
   | *401 / 403* | La cuenta no tiene acceso a la organización | Verificar con el administrador |
   | *401 / 403* | La organización no está respaldada por Entra ID | Método no aplicable (ver `onboarding.md`) |
   | *El servidor no aparece / no arranca* | `npx` o `az` no están en el PATH del sistema | Corregir el PATH y reiniciar el cliente |
   | *El servidor no aparece / no arranca* | El bloque no se escribió | Reejecutar el script; `--dry-run` para inspeccionar |
   | *Timeout / red* | VPN o proxy corporativo | Conectar la VPN o configurar el proxy |

2. Revisa el **log del servidor** en el panel MCP del cliente — suele traer el error real del
   proceso `npx`.
3. Corrige y **reintenta la validación**.
4. **Tras 2 reintentos fallidos:** deja por escrito el último error y los pasos ya verificados, y
   recomienda escalarlo con el administrador de la organización. No sigas probando variantes.

## Cierre

Entrega un resumen con:

- Qué servidor quedó configurado y **en qué archivo de cada cliente**.
- Qué llamada de validación se ejecutó y su resultado.
- Recordatorio: la sesión de `az login` **caduca**. Si en el futuro aparece un 401, lo primero es
  repetir `az login`.

**Aquí termina el alcance de esta skill.** No continúes con otros flujos salvo petición explícita.
