# The Carpe Vault

Mini-app privada para guardar tu biblioteca, progreso, platinos y datos públicos de PSNProfiles.

## Cómo abrirla

Abre este archivo en el navegador:

`carpe-verse-vault/index.html`

No necesita servidor, cuenta ni pagos. Guarda los datos en el navegador con `localStorage`.

## Qué hace ahora

- Importa tu biblioteca pública de PSNProfiles.
- Guarda 371 juegos con progreso, plataforma, enlace y portada.
- Detecta platinos, juegos en progreso y backlog.
- Muestra portadas de PSNProfiles en la biblioteca.
- Permite buscar juegos con RAWG si tienes tu API key guardada.
- Permite preparar/importar listas de trofeos con checks.
- Incluye un volcado local de trofeos detallados para parte de la biblioteca importada.

## Estado del import de PSNProfiles

- Biblioteca importada: 371 juegos.
- Portadas importadas: 371 juegos.
- Trofeos detallados importados: 245 juegos.
- Algunos juegos todavía requieren un segundo parser porque PSNProfiles cambia la estructura de la página según lista, plataforma o DLC.

## Próximos pasos posibles

- Completar el segundo pase de trofeos para los juegos que quedaron sin checklist detallada.
- Añadir vista dedicada de “Platinos”.
- Añadir filtros por trofeos pendientes, porcentaje y dificultad.
- Subir la app online si quieres usarla desde el móvil.
