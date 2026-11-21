# Cambio de alcance: `/make/` pasa a ser Make It Real

Fecha: 2026-11-20. Proveedor de producto: el usuario. Este documento registra el pivote y su
verificación. El reporte anterior (`MAKE-REVIEW-REPORT.md`) queda marcado como histórico.

## Fuera de alcance y retirado

El taller de cinco pasos no correspondía al producto. Se eliminaron:

- El wizard de creación (pasos 1 a 5), sus segmentos, barra de progreso y botones de navegación.
- `site/make/app.js`, `logic.js`, `search.js` y `finale.js`: inspector de cabeceras, búsqueda de
  plantillas en GitHub, generador de prompt, puerta de transferencia y celebración final.
- La demo animada de cinco etapas en la portada y `site/js/maker-cta.js`, con su CSS en
  `site/styles.css`. Ya no hay editor de juegos, flujo de creación ni chatbot embebido.
- Las pruebas que daban por buenas esas funciones. No se tocó el directorio, el Prompt Pad ni
  ningún otro cambio local ajeno.

## Implementado

- `site/make/index.html`: página deliberadamente simple. Explica el producto, ofrece la
  descarga de `SKILL.md`, muestra la ruta de instalación, resume las cuatro preguntas de la
  entrevista y separa las instrucciones del trabajo que la persona hace en su herramienta.
- `site/make/skill/SKILL.md`: la skill portable. Con frontmatter `name: make-it-real`. Entrevista
  sobre consola exacta, cartucho flash o uploader, archivo ROM y sistema operativo. Después
  escribe una guía con cinco partes: detalles verificados, backups, pasos en la herramienta
  externa, verificación y prueba de juego. Regla explícita: la IA escribe instrucciones y nunca
  solicita acceso USB, ejecuta un uploader, escribe un cartucho ni borra una partida.
- `site/make/skill/README.md`: guía de instalación y uso. La convención del repo es
  `.agents/skills/<name>/SKILL.md`, así que la ruta recomendada es
  `.agents/skills/make-it-real/SKILL.md`. También explica cómo entregar el archivo a un
  asistente que acepite skills por attachments.
- Portada: CTA «Make It Real», sin demo de five pasos y sin el script retirado.
- Documentación: `PRODUCT.md`, `README.md` y `DESIGN.md` describen el nuevo alcance.
- `tests/make.test.mjs`: comprueba el enlace de la portada, los enlaces de descarga y guía, la
  ausencia de restos del wizard, el contenido de la entrevista y de la guía de transferencia, y
  que los scripts retirados ya no existan.

## Verificación

| Comprobación | Resultado |
|---|---|
| `npm test` | 47/47 pruebas pasan |
| `npm run check` | sin archivos generados desactualizados |
| `node --check site/js/*.js` | todos los archivos analizan bien |
| Portada → Make | CTA «Make It Real ↗» visible (`opacity: 1`), clic lleva a `/make/`, sin errores |
| Página de la skill | título y `h1` correctos, botón de descarga y enlace a la guía, cuatro secciones, cero etiquetas `<script>`, sin desbordamiento horizontal |
| Descarga | `GET /make/skill/SKILL.md` y `GET /make/skill/README.md` devuelven 200; la página sirve ambos archivos |
| Contenido de la skill | frontmatter, cuatro temas de entrevista, cinco secciones de guía y reglas de seguridad presentes |
| Escritorio 1440×1000 y móvil 390×812 | mismos resultados; sin errores de consola ni de página; el panel decorativo se oculta en móvil |
| Guion de copia | cero guiones largos o cortos unicode en los archivos nuevos y actualizados |

Capturas en `/private/var/folders/lt/lfbc4_451gg2pb0vvbz8lc4m0000gn/T/opencode/make-real-verify/`:
`desktop-landing.png` (1440×1000, 62268 B), `desktop-skill-page.png` (1440×1000, 77069 B),
`desktop-get-skill.png` (1440×1000, 77898 B), `mobile-landing.png` (390×812, 29735 B),
`mobile-skill-page.png` (390×812, 42257 B), `mobile-get-skill.png` (390×812, 50532 B), más
`results.json` con las mediciones. El servidor local se detuvo al terminar.

## Límites declarados

- Verifiqué el recorrido web y el contenido documentado de la skill. No instalé la skill en un
  asistente externo para observar una entrevista en vivo; ese comportamiento queda definido por
  el archivo y comprobado por pruebas de contenido.
- La URL de instalación usa la dirección asumida de GitHub Pages que ya registra `PRODUCT.md`.
  La página indica que se use el enlace de descarga si el sitio está en otra dirección.
- No pude inspeccionar el contenido renderizado de las capturas. La revisión visual se apoya en
  geometría, estilos calculados y estado del DOM.

Se conservaron todos los cambios locales ajenos. No se hizo push, merge, publicación ni deploy,
y no se cambió ningún modelo.

## Actualización: copiar la skill completa

Cambio posterior pedido por el dueño del producto. La página ahora ofrece el botón
«Copy instructions», que lee `skill/SKILL.md` en tiempo de ejecución y copia su texto exacto
al portapapeles. No copia un comando ni un resumen. La descarga y la instalación siguen
disponibles. `site/make/copy-skill.js` tiene un fallback por selección de texto y un mensaje de
error honesto si falla la lectura del archivo.

La skill real se reforzó con: entrevista sobre modelo de consola, cartucho y escritor, sistema
operativo y herramientas, y ruta, formato y procedencia del ROM; consulta de documentación
fiable sin inventar compatibilidades, comandos ni resultados; preservación del original y
backups; confirmación explícita inmediatamente antes de formatear, borrar o escribir; y éxito solo
después de verificar la escritura y probar el juego. La página no contiene estado simulado de
escritura.

Verificación: `npm test` 48/48, `npm run check` limpio, `node --check` del script de copia OK,
cero guiones unicode en el nuevo texto. Un revisor independiente auditó los tres archivos y no
encontró gaps. En Chromium, escritorio 1440×1000 y móvil 390×812: clic en «Copy instructions»
da el mensaje «Skill copied. Paste it into your assistant.»; el portapapeles contiene 5086 bytes,
idénticos byte a byte a `SKILL.md` (también leídos desde una página nueva, sin pérdida al navegar).
Descarga y guía devuelven 200. Sin errores de consola ni desbordamiento horizontal. Capturas en
`/private/var/folders/lt/lfbc4_451gg2pb0vvbz8lc4m0000gn/T/opencode/copy-skill-verify/` con
`results.json` y `paste-results.json`. Limitación: Chromium headless no puede entregar un Ctrl+V
de sistema a una aplicación externa, así que el pegado se validó por lectura exacta del
portapapeles en dos páginas independientes.

No se hizo push, merge, publicación ni deploy y no se cambió ningún modelo.
