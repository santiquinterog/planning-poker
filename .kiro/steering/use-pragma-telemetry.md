# Regla obligatoria para cualquier proyecto y flujo

## Telemetría Pragma

En cada sesión, cada fase del desarrollo de una HU/Incidente se reporta a observabilidad con `pragma-ai workflow` — carga el skill "telemetria-pragma" al arrancar la primera HU y seguí su contrato (una instancia por HU, un `step-id` por fase, `gap-report` sobre el dossier). Si un flujo o desarrollo no tine fases claramente definidas, puedes inferirlas o compactar la sesión en 1 sola fase. **Nunca bloquea**: si un comando falla, informalo en una línea y seguí con la fase — la telemetría no es una puerta de aprobación.

### La telemetría nunca bloquea

El flujo se reporta a observabilidad con `pragma-ai workflow` (skill `telemetria-pragma`). **No es una puerta de aprobación y no puede detener el trabajo**: si un comando falla (sin red, token vencido, `step-id` repetido), se informa en una línea y se sigue. Tampoco se le pregunta nada a la persona por telemetría. Única salvedad: `gap-report --submit` envía una frase redactada por vos, y esa frase se muestra en el chat antes de mandarla.