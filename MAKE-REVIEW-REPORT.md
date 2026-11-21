# Reporte de revisión: `/make/` — Awesome Homebrew Games

> Reporte histórico del taller de cinco pasos. Ese alcance quedó retirado por decisión del
> producto. El alcance actual es Make It Real, una página sencilla que ofrece una skill
> portable para el asistente del usuario. Este archivo se conserva como registro del trabajo
> anterior y no describe el estado actual de `/make/`.

Fecha: 2026-11-20. Alcance original: página `site/make/` (5 pasos + sección AI), enlaces desde la portada,
documentación de diseño/producto, y el flujo completo end-to-end. Sin push, merge ni deploy.

## Cómo se hizo

- Revisión estática de todos los archivos de `site/make/`, `site/js/`, `site/styles.css`,
  `site/index.html`, `DESIGN.md`, `PRODUCT.md` y `docs/DISCOVERY.md`.
- Dos revisores paralelos con tareas separadas y sin solapamiento de archivos: uno para
  `site/make/*`, otro para portada + documentación. Yo integré hallazgos, corregí y verifiqué.
- Recorrido end-to-end y revisión visual con Chromium headless local (1440×1000 y 390×812),
  sirviendo `site/` en `http://127.0.0.1:8123`. Se guardaron capturas antes y después.
- La skill «activar director» se leyó después en
  `/Users/mac/.codex/skills/activate-project-director/SKILL.md` y sus pasos se aplicaron: se
  localizó al director existente de Orca en este proyecto y se le envió una directiva acotada
  (`msg_481af2151a0c`). No se seleccionó ni cambió ningún modelo; la implementación y la
  verificación se hicieron con el agente actual y sus workers.

## Hallazgos corregidos

1. **Alto — GB/NES con cabecera no reconocida no podía transferir.** `site/make/app.js:137-146`:
   el botón exigía `level === "ok"`, pero `logic.js:85` dice explícitamente que muchos builds
   homebrew omiten la marca Nintendo y deben verificarse manualmente. Ahora solo un error real
   de lectura bloquea; las advertencias quedan bajo los tres resguardos existentes (dispositivo,
   copia de seguridad, derechos). Verificado: un `.gb` de 352 bytes sin marca da `level=warn` y
   el botón queda habilitado con estado «Ready to confirm…».
2. **Medio — la búsqueda de plantillas perdía la plataforma.** `site/make/app.js` y
   `site/make/search.js:20-28`: dos handlers de `submit` escribían `#template-search-q`; el
   segundo sobrescribía el query con contexto de plataforma. Quedó un solo handler que compone
   `[plataforma, "homebrew game starter", término]`. Antes: `platformer starter`. Después:
   `NES / Famicom homebrew game starter platformer starter`.
3. **Medio — enlace y hash `#assistant` muertos.** `site/make/app.js:278-304`: el nav
   «AI assistant» y `make/#assistant` no mostraban nada porque `#assistant` solo existe en el
   paso 3. Ahora el enlace y el hash inicial llevan al paso 3 y desplazan a la sección.
   Antes: `01 / 05 · Choose`, visible `step-1`. Después: `03 / 05 · Inspect`, visibles
   `step-3` + `assistant`.
4. **Medio — CTA de la portada invisible sin JavaScript.** `site/index.html:50`: se agregó un
   `<noscript>` con estilos que dejan el bloque y la demo visibles. Opacidad antes: `0`;
   después: `1`.
5. **Medio — la demo del CTA se escapaba del ratón.** `site/js/maker-cta.js:44-47`: al pasar
   el cursor por un paso no se pausaba la rotación automática. Ahora `mouseenter` pausa y
   `mouseleave` reanuda. Antes: tras 3,6 s sobre «Press start» mostraba «Find your starter».
   Después: mantiene «Press start».
6. **Bajo — hooks CSS sin consumir.** `site/make/styles.css:201,208-209,211,238`: `finale.js` escribía
   `is-celebrating` y `data-count` sin que existiera CSS. Ahora la estrella solo anima cuando
   hay celebración (y se respeta `prefers-reduced-motion`), y el contador se muestra como
   sufijo de `#play-status`. Antes: estrella animada incluso oculta. Después: `none` oculta,
   `maker-pop` al completar.
7. **Bajo — formulario de búsqueda.** `site/make/index.html:96-100`: se quitó `name="term"`
   (parámetro ignorado por GitHub con JS desactivado) y `rel` inválido en `<form>`.
8. **Bajo — skip link no enfocable.** `site/make/index.html:34`: `<main id="start">` ahora tiene
   `tabindex="-1"`.
9. **Bajo — detalle de NES y pantalla de la portada.** `site/make/logic.js:92`: etiqueta
   «mapper low bits» → «mapper field» y se decodifican también los bits D11–D8 de NES 2.0
   (byte 8), con prueba nueva en `tests/make.test.mjs`. `site/js/shelf.js:199`:
   la línea «START …» usa `screen-line go`, para que aplique `.screen-line.go { color: paper }`.
10. **Documentación desactualizada.** `DESIGN.md:170` ahora incluye la lista de GitHub y el CTA
    del taller en el orden de secciones. `PRODUCT.md:35` documenta `make/` como taller local de
    cinco pasos, sin subidas ni escrituras de hardware. `site/index.html:164`: el paso «Inspect
    with AI» apunta a `make/#assistant`, coherente con su etiqueta.

Segunda pasada (sin duplicar la primera): se eliminaron los flags muertos `done[2..5]` en
`app.js` (solo `done[1]` se lee), `data-state` ahora tiene reglas CSS en `styles.css` y el mapper
NES 2.0 decodifica los bits altos del byte 8 con su prueba en `tests/make.test.mjs`. La interfaz
sigue advirtiendo que el chequeo de cabecera no verifica compatibilidad completa.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npm test` | 50/50 pruebas pasan (incluye la prueba nueva de NES 2.0 en `tests/make.test.mjs`) |
| `npm run check` | sin archivos generados desactualizados |
| `for f in site/make/*.js site/js/*.js; do node --check "$f"; done` | sintaxis OK, archivo por archivo |
| Errores de consola/página en E2E | 0 en portada, escritorio y móvil |
| Desbordamiento horizontal | `false`: `scrollWidth == innerWidth` (1440/1440 y 390/390) |
| Portada → Make | CTA `#make a.btn[href="make/"]` visible (`opacity:1`), clic navega a `/make/`, sin errores |
| Recorrido E2E escritorio 1440×1000 | pasos 1→2→3→4→5; fixture NES de 22 bytes da reporte `ok` y `mapper field: 0`; transferencia deshabilitada hasta los tres resguardos y luego `Transfer marked complete ✓`; tres `.play-check` en `true`; `#maker-complete` visible, `data-state="done"`, `opacity:1` y dentro del viewport |
| Recorrido E2E móvil 390×812 | mismo resultado; hero visual y «Back» ocultos, segmentos funcionales, navegación sin marcar progreso, panel final visible |
| `#assistant` | desde el paso 4 y al cargar `/make/#assistant` se muestran `step-3` + `assistant`; sin errores |
| Escenario GB `warn` | transferencia habilitada bajo los resguardos |

Evidencia visual final (worker de verificación, Chromium/Playwright headless, servidor detenido al
terminar). Capturas verificadas como PNG válidos: `director-landing.png` (1440×1000, 102040 B),
`director-make-desktop-01-hero.png` (1440×1000, 107462 B),
`director-make-desktop-02-inspect.png` (1440×1000, 106948 B),
`director-make-desktop-03-complete.png` (1440×1000, 97152 B),
`director-make-mobile-01.png` (390×812, 38620 B),
`director-make-mobile-02-inspect.png` (390×812, 47297 B) y
`director-make-mobile-02-complete.png` (390×812, 31866 B), en
`/private/var/folders/lt/lfbc4_451gg2pb0vvbz8lc4m0000gn/T/opencode/director-verify/`
(junto con `results.json` y `refine.json`). Capturas anteriores de antes/después en
`/private/var/folders/lt/lfbc4_451gg2pb0vvbz8lc4m0000gn/T/opencode/` (`baseline-*.png`,
`after-*.png`).

Limitación honesta: no inspeccioné el contenido renderizado de las imágenes (el lector de imágenes
está bloqueado para el directorio externo y este modelo no acepta entrada de imagen). La
verificación visual se apoya en geometría, estilos calculados, visibilidad, estado del DOM y
capturas emitidas por el navegador; las capturas quedan como evidencia para que las revises tú.

## Estado del repositorio

Se conservaron todos los cambios locales preexistentes (archivos modificados y sin seguimiento).
Los cambios añadidos en esta revisión están en `site/make/`, `site/index.html`, `site/js/shelf.js`,
`site/js/maker-cta.js`, `DESIGN.md` y `PRODUCT.md`. No se hizo push, merge ni deploy. Se
eliminaron los artefactos temporales de prueba del repositorio; este reporte es el único archivo
nuevo creado por esta revisión. El repositorio ya tenía otros archivos sin seguimiento, entre
ellos `.orca-evidence-make-390.png` y `.orca-evidence-make-809.png`, que se conservaron.
