# The Carpe Vault

Aplicación privada para organizar la biblioteca de PlayStation, consultar progreso, platinos, trofeos y paquetes DLC.

## Cómo abrirla

Ejecuta `abrir-carpe-vault.bat`. La aplicación se abrirá en `http://127.0.0.1:8788/`.

## Funciones actuales

- Biblioteca importada desde el perfil público de PSNProfiles.
- Portadas en alta resolución obtenidas desde RAWG.
- Trofeos conseguidos y pendientes, separados entre juego base y DLC.
- Buscador de la biblioteca y del catálogo externo de RAWG.
- Filtros por plataforma, progreso, backlog y platino.
- Aplicación web instalable (PWA) con icono y modo independiente.
- Caché de la interfaz y los datos importados para poder abrirla sin conexión.
- Copia de seguridad JSON y restauración desde Configuración.
- Registro de la última sincronización correcta con PSNProfiles.

## Seguridad y datos

La biblioteca se guarda en el navegador. Las copias de seguridad contienen juegos, progreso, usuario de PSNProfiles y organización de los DLC. La clave de RAWG no se exporta y permanece oculta en la interfaz.

## Próxima fase

El siguiente paso es añadir almacenamiento remoto autenticado para compartir la misma biblioteca entre PC y móvil sin depender de una copia manual.
