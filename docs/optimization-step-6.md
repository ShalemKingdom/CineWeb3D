# Smart Diagnostic Engine / Motor de diagnóstico

## Use / Uso
In the coffee demo footer or video example, open Developer diagnostics, select Start local diagnostics, interact with the scene, then Refresh report. Stop disconnects observers and discards the session. No network reporting, storage, cookies, or autonomous RAF. The panel is diagnostic tooling, not a site analytics system. The initial report can be empty until observer entries arrive.

En el pie de la demo o ejemplo de video, abre el diagnóstico, actívalo, desplázate y actualiza el informe. Detener desconecta observadores y descarta la sesión. No se transmiten datos. Los FPS son estimaciones de intervalos de fotogramas activos (máximo 120 muestras); no representan una prueba continua de GPU. Los contadores de geometrías, texturas, triángulos, llamadas de dibujo y píxeles son indicadores indirectos, no memoria GPU en bytes. El conteo de tareas largas depende del soporte del navegador. Errores registrados por categoría, no mensajes privados. El informe no contiene URLs.

## Budgets / Presupuestos
- GLB/glTF: 2 MiB; image: 200 KiB; desktop video: 5 MiB; mobile.mp4: 2 MiB.
- Initial known transferred bytes: 1 MiB, using navigation loadEventEnd as the cutoff if available. Not a complete measure of all downloaded or decoded content.
- Active FPS: 30 minimum target, assessed after 12 valid intervals. Slow frame: >50 ms.
- Resource timing includes cached responses and network transfers where exposed by the browser. Zero sizes can be unknown (e.g. cross-origin privacy restrictions); repeated positive transfers are a signal, not proof of waste. Maximum 256 distinct tracked URLs, no URLs exported. Browser buffer truncation can make historical data incomplete. Real-device checks remain required.

## Local audit / Auditoría local
```
npm run diagnostics:assets -- public
npm run diagnostics:assets -- dist --strict
```
The CLI reads file sizes only, skips symlinks inside the audited directory, never modifies assets. `--strict` exits 1 for budget violations; invalid input exits 2. CI uses dist after build; adjust budgets only with documented justification. This is separate from initial transfer and does not replace Lighthouse, visual tests or validation of GLB contents.

El análisis de archivos funciona sin instalar dependencias. No mide memoria real, calidad visual o consumo de batería. No sustituye a Lighthouse ni a pruebas en dispositivos reales. No se añadieron repositorios ni servicios de pago. Las pruebas unitarias usan datos simulados; el flujo en navegador aún requiere la instalación npm y la validación integral.
