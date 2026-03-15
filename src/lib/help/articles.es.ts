import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Bienvenido a Mix Architect",
    "category": "getting-started",
    "summary": "Un recorrido rápido por la plataforma: tu panel de control, lanzamientos, pistas y herramientas de colaboración.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Tu Panel de Control",
        "body": "Después de iniciar sesión llegas al [Panel de control](/app). Muestra todos tus lanzamientos en una cuadrícula responsiva, ordenados por la actividad más reciente. Cada tarjeta de lanzamiento muestra su portada, título, nombre del artista, punto de estado (codificado por colores para Borrador, En progreso o Listo), etiqueta de tipo de lanzamiento (Sencillo, EP o Álbum), etiqueta de formato (Estéreo, Dolby Atmos o Estéreo + Atmos) y un recuento de finalización de pistas como \"1 de 6 pistas briefadas\". Si el [seguimiento de pagos](/app/settings) está habilitado, también verás estadísticas resumen de pagos en la parte superior: Pendientes, Ganados y Honorarios totales en todos los lanzamientos, con un enlace \"Ver todo\" a la página de [Pagos](/app/payments). Usa el icono de chincheta en cualquier tarjeta de lanzamiento para fijarla en la parte superior de tu panel de control, y el menú de tres puntos para acciones rápidas. El menú desplegable de ordenación te permite ordenar lanzamientos por Última modificación, Título o Fecha de creación.",
        "mockup": "dashboard"
      },
      {
        "heading": "Vista Cuadrícula vs Cronología",
        "body": "El encabezado del panel de control tiene dos botones de cambio de vista: Cuadrícula y Cronología. La vista Cuadrícula (por defecto) muestra tus lanzamientos como tarjetas en una cuadrícula responsiva. La vista Cronología organiza los lanzamientos cronológicamente según sus fechas objetivo de lanzamiento, mostrando cuentas atrás e información de programación. Tu preferencia de vista se guarda automáticamente. Aprende más en [Usar la Vista Cronología](/app/help?article=timeline-overview)."
      },
      {
        "heading": "Navegar por la Aplicación",
        "body": "La barra lateral (escritorio) o barra inferior (móvil) te da acceso rápido a cada sección de la aplicación: [Panel de control](/app) para tus lanzamientos, Buscar (o Cmd+K / Ctrl+K) para ir a cualquier lanzamiento o pista al instante, [Plantillas](/app/templates) para ajustes preestablecidos de lanzamientos reutilizables, [Pagos](/app/payments) para seguimiento de honorarios (si está habilitado), [Configuración](/app/settings) para tu perfil, valores por defecto y suscripción, y [Ayuda](/app/help) para documentación. La barra lateral también incluye Notificaciones para actualizaciones de actividad, Auto para funciones de automatización y Cerrar sesión. El cambio de tema entre modos Claro, Oscuro y Sistema está disponible en [Configuración](/app/settings) bajo Apariencia.",
        "tip": "Pulsa Cmd+K (Mac) o Ctrl+K (Windows) desde cualquier lugar de la aplicación para buscar instantáneamente e ir a cualquier lanzamiento o pista.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Conceptos Clave",
        "body": "Los lanzamientos son tus proyectos de nivel superior (álbumes, EPs o sencillos). Cada lanzamiento contiene una o más pistas. En escritorio, la página de detalle del lanzamiento tiene un diseño de dos columnas: la lista de pistas a la izquierda y una barra lateral inspectora a la derecha que muestra la portada, Información del Lanzamiento (artista, tipo, formato, estado, fecha objetivo, género), Dirección Global de Mezcla, Referencias Globales y estado de Pago. Cada pista tiene seis pestañas: Intención, Especificaciones, Audio, Distribución, Portal y Notas. Haz clic en el icono de engranaje de configuración en el encabezado del lanzamiento para abrir Configuración del Lanzamiento, donde puedes editar todos los metadatos, gestionar tu equipo y configurar el pago. El encabezado también tiene botones para el interruptor del Portal (con un enlace para abrir el portal), Guardar como Plantilla y el engranaje de configuración.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Crear tu Primer Lanzamiento",
    "category": "getting-started",
    "summary": "Guía paso a paso para crear un lanzamiento, añadir portada, subir pistas y establecer tu estado.",
    "tags": [
      "create",
      "release",
      "new project",
      "setup"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Crear un Nuevo Lanzamiento",
        "body": "Desde el [Panel de control](/app), haz clic en el botón \"+ Nuevo Lanzamiento\" en la esquina superior derecha. Si tienes [plantillas](/app/templates) guardadas, se muestra primero un selector de plantillas donde puedes seleccionar una plantilla o hacer clic en \"Empezar desde cero\". El formulario de creación pide un título, un nombre opcional de artista/cliente, tipo de lanzamiento (Sencillo, EP o Álbum), formato (Estéreo, Dolby Atmos o Estéreo + Atmos), etiquetas de género (elige entre sugerencias como Rock, Pop, Hip-Hop, Electrónica, etc. o añade las tuyas propias) y una fecha objetivo de lanzamiento.",
        "tip": "Cuando creas un Sencillo, se crea automáticamente una pista con el título del lanzamiento y tus especificaciones por defecto de [Configuración](/app/settings) aplicadas.",
        "mockup": "create-release"
      },
      {
        "heading": "La Página de Detalle del Lanzamiento",
        "body": "Después de la creación, llegas a la página de detalle del lanzamiento. En escritorio tiene un diseño de dos columnas: la lista de pistas a la izquierda con un botón \"Flujo\" y un botón \"+ Añadir Pista\", y una barra lateral inspectora a la derecha. La barra lateral inspectora muestra la portada, Información del Lanzamiento (Artista, Tipo, Formato, Estado, Fecha Objetivo, Género), Dirección Global de Mezcla (haz clic en el icono de lápiz para actualizar) y Referencias Globales (haz clic en \"+ Añadir\" para buscar y añadir pistas de referencia). Si el seguimiento de pagos está habilitado, la sección de Pago aparece en la parte inferior de la barra lateral. Para añadir o cambiar la portada, haz clic en el icono de lápiz en la ilustración de la barra lateral. Esto revela opciones debajo de la imagen: un botón Subir para elegir un archivo, un botón Quitar (si ya existe ilustración) y un campo \"O pegar URL\" para enlazar una imagen directamente. Los nuevos lanzamientos muestran un área de subida con líneas discontinuas con \"Haz clic para subir\" (JPEG o PNG, mín 1400x1400). Para editar otros metadatos del lanzamiento, haz clic en el icono de engranaje de configuración en el encabezado para abrir Configuración del Lanzamiento.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Añadir Pistas",
        "body": "En la vista de detalle del lanzamiento, haz clic en \"+ Añadir Pista\" en el encabezado junto al botón Flujo. Dale un título a tu pista y se creará con tus especificaciones por defecto de [Configuración](/app/settings) aplicadas. Cada pista aparece en la lista con un número, título, vista previa de intención, punto de estado e insignia de aprobación. Puedes arrastrar pistas para reordenarlas usando el controlador de agarre a la izquierda, o usar los botones subir/bajar. Elimina pistas con el icono de papelera a la derecha. Haz clic en cualquier pista para abrirla y empezar a trabajar en sus seis pestañas.",
        "mockup": "track-upload"
      },
      {
        "heading": "Establecer Estado del Lanzamiento",
        "body": "Cada lanzamiento tiene un estado: Borrador, En progreso o Listo. Puedes cambiar el estado desde la barra lateral inspectora haciendo clic en la insignia de estado junto a \"Estado\" en la sección Información del Lanzamiento, o desde Configuración del Lanzamiento (icono de engranaje). Un lanzamiento cambia automáticamente a En progreso una vez que se ha empezado a trabajar en él (por ejemplo, subir audio o añadir pistas). El color de la insignia de estado aparece en las tarjetas de lanzamiento de tu [Panel de control](/app) (naranja para Borrador, azul para En progreso, verde para Listo) y es visible para todos los colaboradores y en el portal del cliente.",
        "mockup": "release-status"
      }
    ]
  },
  {
    "id": "invite-collaborators",
    "title": "Invitar Colaboradores a un Lanzamiento",
    "category": "getting-started",
    "summary": "Comparte tu lanzamiento con miembros del equipo y clientes externos usando roles y el portal.",
    "tags": [
      "collaborators",
      "invite",
      "share",
      "team",
      "permissions"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Enviar Invitaciones",
        "body": "Abre un lanzamiento y haz clic en el icono de engranaje de configuración en el encabezado para ir a Configuración del Lanzamiento. Desplázate hacia abajo pasando los metadatos del lanzamiento hasta la sección Equipo en la parte inferior. Introduce la dirección de correo electrónico de la persona que quieres invitar, selecciona su rol del desplegable (Colaborador o Cliente) y haz clic en \"Invitar\". Recibirán un correo electrónico con un enlace para unirse al lanzamiento. Los miembros activos del equipo aparecen debajo del formulario de invitación con su correo electrónico, insignia de rol, estado y un botón eliminar para quitarlos.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Roles Colaborador vs Cliente",
        "body": "Hay dos roles. Los Colaboradores tienen acceso completo para ver y editar todo el contenido del lanzamiento: pistas, intención, especificaciones, audio, notas, metadatos de distribución y configuración del lanzamiento. Los Clientes tienen acceso de solo lectura a través del portal del cliente y pueden proporcionar comentarios a través de comentarios, aprobar o solicitar cambios en pistas individuales y descargar archivos de audio si se permite. La insignia de rol se muestra junto al correo electrónico de cada miembro del equipo en la sección Equipo.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Aceptar Invitaciones",
        "body": "Cuando alguien hace clic en el enlace de invitación y se une al lanzamiento, aparece en la lista de Equipo con su insignia de rol y estado \"Activo\". Recibirás una notificación en la aplicación informándote de que se han unido. Los invitados que no tengan una cuenta de Mix Architect serán invitados a crear una cuando hagan clic en el enlace de invitación.",
        "tip": "Puedes quitar a un miembro del equipo en cualquier momento haciendo clic en el icono de papelera junto a su nombre en la sección Equipo de Configuración del Lanzamiento.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Compartir Portal del Cliente",
        "body": "Para partes interesadas externas que necesiten revisar sin iniciar sesión, activa el portal del cliente desde el encabezado de la página de detalle del lanzamiento. Haz clic en el interruptor Portal para activarlo (el interruptor se vuelve verde cuando está activo), luego usa el icono de enlace junto al interruptor para copiar la URL única de compartir. El portal proporciona acceso de solo lectura al brief del lanzamiento, lista de pistas, reproducción de audio y comentarios. Puedes configurar exactamente qué es visible usando la configuración del portal: dirección de mezcla, especificaciones, referencias, estado de pago, información de distribución y letras. Para control por pista, usa la pestaña Portal en cada pista.",
        "mockup": "portal-sharing"
      }
    ]
  },
  {
    "id": "track-tabs",
    "title": "Detalle de Pista: Entender las Pestañas",
    "category": "releases",
    "summary": "Cada pista tiene seis pestañas para gestionar cada aspecto de tu mezcla: Intención, Especificaciones, Audio, Distribución, Portal y Notas.",
    "tags": [
      "tracks",
      "tabs",
      "intent",
      "specs",
      "audio",
      "distribution",
      "portal",
      "notes"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Intención",
        "body": "La pestaña Intención es donde describes la visión creativa para una pista. En la parte superior hay un área de texto de forma libre bajo \"¿Cómo debería sentirse esta pista?\" donde puedes escribir la dirección de la mezcla (haz clic en \"Editar\" para modificar). Debajo de eso, la sección Cualidades Emocionales te permite etiquetar la pista con palabras descriptivas: las etiquetas seleccionadas aparecen como pastillas rellenas (ej. espacioso, cálido, contundente, nostálgico), y las sugerencias disponibles aparecen como pastillas con contorno que puedes hacer clic para añadir (agresivo, íntimo, arenoso, pulido, oscuro, brillante, crudo, exuberante, onírico, lo-fi, cinemático, minimal, denso, etéreo, hipnótico, eufórico, melancólico, orgánico, sintético, caótico, suave, inquietante, juguetón, himno, delicado, pesado, aéreo). La sección Anti-Referencias en la parte inferior te permite describir sonidos o enfoques que quieres evitar. En la barra lateral derecha, Vista Rápida muestra el estado de la pista, calidad de audio (frecuencia de muestreo / profundidad de bits) y formato de un vistazo. Debajo de eso, la sección Referencias te permite buscar y añadir pistas de referencia (de Apple Music) con notas opcionales describiendo qué referenciar sobre cada una.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Especificaciones",
        "body": "La pestaña Especificaciones contiene las especificaciones técnicas para tu pista. La sección Configuración Técnica tiene tres desplegables: Formato (Estéreo, Dolby Atmos o Estéreo + Atmos), Frecuencia de Muestreo (44.1kHz, 48kHz, 88.2kHz, 96kHz) y Profundidad de Bits (16-bit, 24-bit, 32-bit float). Estos valores son metadatos de referencia que describen el audio fuente y se usan como valores por defecto para nuevas pistas creadas desde plantillas, no se usan para controlar la salida de conversión. Debajo de eso, la sección Entrega gestiona tus formatos de salida. Selecciona qué formatos deberían estar disponibles haciendo clic en las fichas de formato: los formatos convertibles incluyen WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos no convertibles (DDP, ADM BWF/Atmos, MQA) pueden ser seleccionados para referencia pero muestran un tooltip informativo explicando que no pueden ser auto-convertidos. Los formatos seleccionados aparecen resaltados en verde con una marca de verificación. Usa el desplegable \"Exportar desde\" para elegir desde qué versión de audio convertir (ej. \"v3 - Typical Wonderful 2025-10-10 MGO.wav (última)\"). Haz clic en el icono de flecha de descarga junto a cualquier formato convertible seleccionado para iniciar una conversión. También puedes escribir un nombre de formato personalizado en el campo \"Formato personalizado...\" y hacer clic en \"+ Añadir\". En la parte inferior, el área de texto Requisitos Especiales te permite anotar cualquier instrucción específica de entrega.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "La pestaña Audio es donde subes archivos, gestionas versiones y reproduces audio. El encabezado muestra el nombre del lanzamiento y la pista con la portada del álbum. El selector de versión (v1, v2, v3, etc.) te permite cambiar entre revisiones, haz clic en el botón + para subir una nueva versión. Cada versión muestra su número de versión, fecha de subida, recuento de comentarios y un botón de descarga. La visualización de forma de onda muestra el audio con reproducción interactiva: haz clic en cualquier lugar para buscar, y usa los controles de transporte debajo (bucle, saltar atrás, reproducir/pausa, saltar adelante, repetir). La medición de sonoridad LUFS se muestra junto a los metadatos del archivo (formato, frecuencia de muestreo, profundidad de bits), codificada por colores contra objetivos de sonoridad. La sección Comentarios debajo de la forma de onda muestra todos los comentarios con marca de tiempo para la versión actual. Haz doble clic en cualquier lugar de la forma de onda para añadir un nuevo comentario en ese código de tiempo. Los marcadores de comentarios aparecen como pequeños iconos en la forma de onda en sus posiciones respectivas.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Análisis de Sonoridad (LUFS)",
        "body": "Cuando subes audio, Mix Architect mide automáticamente la sonoridad integrada en LUFS (Unidades de Sonoridad Escala Completa). Haz clic en la lectura LUFS junto a los metadatos de versión para expandir el panel Análisis de Sonoridad. Esto muestra cómo cada servicio principal de streaming, estándar de transmisión y plataforma social ajustará tu pista durante la reproducción. Cada fila muestra el nombre de la plataforma, su sonoridad objetivo (ej. Spotify apunta a -14 LUFS) y el cambio de ganancia que se aplicaría a tu archivo. Un valor positivo significa que el servicio subirá tu pista, un valor negativo (mostrado en naranja) significa que se bajará. Por ejemplo, si tu mezcla mide -14.9 LUFS, Spotify aplicaría +0.9 dB mientras Apple Music (objetivo -16) aplicaría -1.1 dB. El panel está agrupado en Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Transmisión (EBU R128, ATSC A/85, ITU-R BS.1770) y Social (Instagram/Reels, TikTok, Facebook). Usa esto para comprobar si tu máster será alterado significativamente en cualquier plataforma antes de la entrega.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribución",
        "body": "La pestaña Distribución captura todos los metadatos necesarios para distribución digital. Incluye tres secciones divididas, cada una con botones \"+ Añadir Persona\": División de Composición (nombre de persona, porcentaje, afiliación PRO como ASCAP/BMI, número de Cuenta de Miembro y número Writer IPI), División de Edición (nombre de editorial, porcentaje, ID de Miembro Editorial e IPI de Editorial) y División de Grabación Máster (nombre de entidad y porcentaje). El total acumulado para cada sección de división se muestra en verde cuando es igual a 100% o naranja cuando no lo es. Debajo de las divisiones: Códigos e Identificadores (campos ISRC e ISWC), Créditos (nombres de productor y compositor/letrista), Propiedades de Pista (artista invitado, selector de idioma, interruptores para letras explícitas, instrumental y canción cover), Copyright (número de registro y fecha de copyright) y Letras (área de texto de letras completas).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "La pestaña Portal controla cómo los clientes interactúan con esta pista específica. En la parte superior, la sección Aprobación del Cliente muestra el estado actual de aprobación (ej. \"Aprobado\" en verde) junto con un historial cronológico de todos los eventos de aprobación: aprobado, cambios solicitados (con la nota del cliente), reabierto para revisión y re-aprobado, cada uno con fechas. Debajo de eso, Visibilidad del Portal de Pista te permite alternar si esta pista es visible en el portal, si las descargas están habilitadas y a qué versiones de audio específicas (Versión 1, Versión 2, Versión 3, etc.) puede acceder el cliente, cada una con su propio interruptor. Una nota en la parte inferior te recuerda que la activación del portal y el enlace de compartir se pueden encontrar en el encabezado de la página del lanzamiento.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notas",
        "body": "La pestaña Notas es un espacio de propósito general para notas de revisión y discusión que no está atado a un código de tiempo específico. En la parte superior hay un área de texto con el marcador de posición \"Añadir una nota...\" y un botón \"Publicar\". Las notas aparecen debajo en orden cronológico inverso. Cada nota muestra el nombre del autor, una fecha o tiempo relativo y el mensaje. Las notas del cliente se distinguen visualmente con una insignia verde \"Cliente\" para que puedas distinguir comentarios internos de externos de un vistazo. Usa esta pestaña para direcciones generales de revisión, elementos pendientes y discusión que no necesite referenciar un momento específico en el audio. Para comentarios específicos de tiempo, usa los comentarios de forma de onda de la pestaña Audio en su lugar.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Portal del Cliente y Aprobaciones",
    "category": "releases",
    "summary": "Comparte tu lanzamiento con clientes via un enlace único, controla lo que ven y rastrea aprobaciones por pista.",
    "tags": [
      "portal",
      "client",
      "approval",
      "sharing",
      "review"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Activar el Portal",
        "body": "En la página de detalle del lanzamiento, busca el interruptor Portal en el área del encabezado (parte superior derecha). Haz clic en el interruptor para activarlo (se vuelve verde cuando está activo). Una vez activo, haz clic en el icono de enlace junto al interruptor para copiar la URL única de compartir. Envía este enlace a tu cliente para acceso de revisión sin requerir una cuenta de Mix Architect. El portal muestra el brief del lanzamiento, lista de pistas, reproductores de audio y un sistema de comentarios. Usa la configuración del portal para controlar qué secciones a nivel de lanzamiento son visibles para los clientes: dirección de mezcla, especificaciones, referencias, estado de pago, metadatos de distribución y letras.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Visibilidad por Pista",
        "body": "Para cada pista, ve a la pestaña Portal para controlar qué puede ver tu cliente. La sección Visibilidad del Portal de Pista tiene interruptores para: \"Visible en el portal\" (mostrar u ocultar toda la pista), \"Habilitar descarga\" (permitir o bloquear descargas de audio) e interruptores de versiones individuales (Versión 1, Versión 2, Versión 3, etc.) para controlar a qué revisiones de audio puede acceder el cliente. Esto te da control granular para que puedas ocultar trabajos en progreso y solo compartir mezclas terminadas. Todos los interruptores son independientes, así que puedes hacer una pista visible pero deshabilitar descargas, o mostrar solo la versión más reciente.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Aprobaciones de Pista",
        "body": "Los clientes pueden aprobar o solicitar cambios en pistas individuales a través del portal. El estado de aprobación se rastrea en la sección Aprobación del Cliente de la pestaña Portal de cada pista. El estado muestra una insignia coloreada (ej. \"Aprobado\" en verde) con un historial cronológico completo de cada evento de aprobación: cuándo el cliente aprobó, cuándo solicitaron cambios (incluyendo su nota, como \"Voces muy bajas\"), cuándo la pista fue reabierta para revisión y cuándo fue re-aprobada. Esto te da un registro de auditoría claro de todas las decisiones del cliente. Las insignias de aprobación también aparecen en la lista de pistas en la página de detalle del lanzamiento, para que puedas ver de un vistazo qué pistas están aprobadas.",
        "mockup": "portal-approval"
      }
    ]
  },
  {
    "id": "templates",
    "title": "Usar Plantillas de Lanzamiento",
    "category": "releases",
    "summary": "Ahorra tiempo creando lanzamientos desde plantillas reutilizables con especificaciones y configuraciones preconfiguradas.",
    "tags": [
      "templates",
      "reuse",
      "workflow",
      "presets"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Qué Incluyen las Plantillas",
        "body": "Una plantilla captura un conjunto comprensivo de valores por defecto de lanzamiento a través de seis secciones colapsables. Básicos: nombre de plantilla, descripción, casilla \"Establecer como plantilla por defecto\" (auto-seleccionada para nuevos lanzamientos) y nombre y email de artista/cliente. Configuración de Lanzamiento: tipo de lanzamiento (Sencillo, EP o Álbum), formato (Estéreo, Dolby Atmos o Estéreo + Atmos) y etiquetas de género. Especificaciones Técnicas: frecuencia de muestreo, profundidad de bits, selecciones de formato de entrega (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) y requisitos especiales. Valores por Defecto de Intención: etiquetas de cualidad emocional preseleccionadas para nuevas pistas. Metadatos de Distribución: distribuidor, sello discográfico, titular de copyright, idioma, género primario y contactos de derechos y edición. Valores por Defecto de Pago: estado de pago, moneda y notas de pago. Cuando creas un lanzamiento desde una plantilla, todos estos valores por defecto se aplican automáticamente.",
        "mockup": "template-contents"
      },
      {
        "heading": "Crear y Gestionar Plantillas",
        "body": "Hay dos maneras de crear una plantilla. Desde cualquier página de detalle de lanzamiento, haz clic en el botón \"Guardar como Plantilla\" en el encabezado (junto al engranaje de configuración) para capturar la configuración actual de ese lanzamiento. O ve a la página [Plantillas](/app/templates) y haz clic en \"+ Nueva Plantilla\" para construir una desde cero usando el formulario completo de plantilla. Cada tarjeta de plantilla en la página [Plantillas](/app/templates) muestra su nombre, descripción y una línea resumen como \"Sencillo, Estéreo + Atmos, 96 kHz / 24-bit, 4 formatos de entrega\". Usa el menú de tres puntos en cualquier tarjeta de plantilla para opciones como editar o eliminar. Dale a las plantillas nombres descriptivos como \"Máster Estéreo\" o \"EP Atmos\" para mantenerlas organizadas.",
        "mockup": "template-create"
      },
      {
        "heading": "Crear un Lanzamiento desde una Plantilla",
        "body": "Al crear un nuevo lanzamiento desde el [Panel de control](/app), si tienes plantillas guardadas, se muestra un selector \"Empezar desde una plantilla\" como primer paso. Dice \"Pre-rellenar tu configuración de lanzamiento, o empezar desde cero.\" Selecciona una tarjeta de plantilla y haz clic en \"Usar Plantilla\" para pre-rellenar el formulario de nuevo lanzamiento con esa configuración, o haz clic en \"Empezar desde cero\" para saltar. El formulario de crear lanzamiento también tiene un enlace \"Cambiar plantilla\" en la parte inferior si quieres cambiar. Cualquier configuración de plantilla puede ser personalizada después de que el lanzamiento sea creado.",
        "tip": "Marca tu plantilla más usada como la por defecto (casilla \"Establecer como plantilla por defecto\") para que sea auto-seleccionada siempre que crees un nuevo lanzamiento.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Seguimiento de Pagos",
    "category": "releases",
    "summary": "Rastrea honorarios, pagos y saldos pendientes a través de tus lanzamientos.",
    "tags": [
      "payments",
      "fees",
      "billing",
      "tracking",
      "invoicing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Habilitar Seguimiento de Pagos",
        "body": "Ve a [Configuración](/app/settings) y encuentra la sección Seguimiento de Pagos. La sección dice: \"Rastrea honorarios y estado de pago en lanzamientos y pistas. Desactiva esto si estás mezclando tus propios proyectos.\" Activa \"Habilitar seguimiento de pagos\". Una vez habilitado, las funciones relacionadas con pagos aparecen en toda la aplicación: estadísticas de honorarios en el [Panel de control](/app) (Pendientes, Ganados, Honorarios Totales), una sección de Pago en la barra lateral inspectora en cada lanzamiento y la página [Pagos](/app/payments) en la navegación de la barra lateral.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Establecer Honorarios de Lanzamiento",
        "body": "Abre Configuración del Lanzamiento (haz clic en el icono de engranaje en cualquier lanzamiento). Desplázate hacia abajo hasta la sección Pago. Establece el Estado de Pago: Sin Honorario, Sin pagar, Parcial o Pagado. Usa el área de texto Notas de Pago para registrar términos, información de depósito o fechas de vencimiento. El importe del honorario e información de pago también es visible en la barra lateral inspectora en la página de detalle del lanzamiento bajo el encabezado Pago, donde puedes hacer clic en el estado para cambiarlo rápidamente.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Panel de Pagos",
        "body": "Accede a la página [Pagos](/app/payments) desde la barra lateral. En la parte superior, tres tarjetas resumen muestran Pendientes (total sin pagar), Ganados (total pagado) y Honorarios Totales a través de todos los lanzamientos, cada una con un recuento de lanzamientos. Debajo, una tabla lista cada lanzamiento con datos de pago: nombre de Lanzamiento, Fecha, Artista, Honorario, Pagado, Saldo y Estado (con insignias coloreadas como \"Parcial\" en naranja). Una fila Total en la parte inferior suma todos los honorarios. Usa el botón \"Exportar CSV\" para descargar datos de pago como una hoja de cálculo, o \"Descargar PDF\" para generar un resumen de pagos listo para imprimir.",
        "tip": "Haz clic en las tarjetas de estadísticas Pendientes o Ganados en el [Panel de control](/app) para filtrar rápidamente a lanzamientos que coincidan con ese estado de pago.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Seguimiento de Distribución",
    "category": "releases",
    "summary": "Rastrea dónde se ha enviado tu lanzamiento, monitoriza el estado en las plataformas y recibe notificaciones cuando esté disponible en Spotify.",
    "tags": [
      "distribution",
      "tracker",
      "spotify",
      "apple music",
      "platform",
      "status",
      "live",
      "submitted"
    ],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Añadir Plataformas a un Lanzamiento",
        "body": "Abre cualquier lanzamiento y desplázate hasta el panel de Seguimiento de Distribución debajo de la lista de pistas. Haz clic en \"+ Añadir Plataforma\" para agregar una plataforma de streaming. Elige entre Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud o Bandcamp. Cada plataforma aparece como una fila con su logotipo oficial, un indicador de estado y una etiqueta de distribuidor. También puedes usar \"Marcar como Enviado\" para añadir varias plataformas a la vez: selecciona un distribuidor (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote o Auto-publicado), marca las plataformas a las que enviaste y haz clic en Enviar.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Estados de Distribución",
        "body": "Cada entrada de plataforma tiene un estado que rastrea en qué punto del proceso de lanzamiento se encuentra. Los seis estados son: No Enviado (gris, por defecto para plataformas recién añadidas), Enviado (azul, has mandado el lanzamiento a tu distribuidor), En Proceso (naranja, el distribuidor está revisando o procesando), En Línea (verde, el lanzamiento está disponible en la plataforma), Rechazado (rojo, la plataforma o el distribuidor rechazó el lanzamiento) y Retirado (rojo, el lanzamiento estuvo disponible previamente pero ha sido eliminado). Haz clic en el indicador de estado de cualquier fila de plataforma para cambiarlo. Los cambios de estado se registran en el historial de la plataforma para que puedas ver cuándo ocurrió cada transición.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Detección Automática de Spotify",
        "body": "Spotify aparece en la parte superior del Seguimiento de Distribución con una etiqueta \"Se actualiza automáticamente\". Una vez que marques Spotify como Enviado, Mix Architect comprueba periódicamente el catálogo de Spotify buscando tu lanzamiento usando el código ISRC (de la pestaña Distribución de la pista) o el título del lanzamiento y el nombre del artista. Cuando tu lanzamiento se encuentra en Spotify, el estado cambia automáticamente a En Línea, la URL de Spotify se guarda y recibes una notificación. También puedes hacer clic en \"Comprobar Ahora\" para activar una comprobación inmediata. La detección automática se ejecuta diariamente para todas las entradas de Spotify enviadas.",
        "tip": "Rellena el código ISRC en la pestaña Distribución de tu pista antes de enviar. La detección basada en ISRC es más fiable que la coincidencia por título/artista, especialmente para nombres comunes.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Actualizar Estado y Añadir Enlaces",
        "body": "Para cambiar el estado de una plataforma, haz clic en el indicador de estado de la fila de la plataforma. Aparece una fila de pastillas de estado donde puedes seleccionar el nuevo estado. Para añadir un enlace al lanzamiento en esa plataforma, haz clic en \"Añadir enlace\" junto al nombre de la plataforma. Introduce la URL (por ejemplo, el enlace del álbum en Spotify o la página de Apple Music) y haz clic en Guardar. El icono de enlace se convierte en un enlace externo clicable que abre la página del lanzamiento en esa plataforma. Usa el menú de tres puntos en cualquier fila de plataforma para opciones adicionales: editar detalles, eliminar la plataforma o ver el historial de cambios de estado.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Envío Masivo y Actualización",
        "body": "\"Marcar como Enviado\" te permite registrar un envío por lotes a tu distribuidor. Selecciona el distribuidor del menú desplegable, marca las plataformas a las que enviaste y haz clic en Enviar. Todas las plataformas seleccionadas se añaden con estado Enviado y la etiqueta del distribuidor. \"Comprobar Ahora\" aparece en las entradas de Spotify que han sido enviadas. Al hacer clic se activa una búsqueda inmediata en el catálogo de Spotify. Si se encuentra, el estado se actualiza a En Línea y la URL se guarda automáticamente. Para todas las demás plataformas (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp), actualiza el estado manualmente cuando confirmes que el lanzamiento está disponible.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Etiquetas de Distribuidor",
        "body": "Cada entrada de plataforma puede tener una etiqueta de distribuidor que muestra qué servicio usaste para enviar (DistroKid, TuneCore, CD Baby, etc.). Aparece como una pequeña pastilla junto al indicador de estado. Las etiquetas de distribuidor se establecen automáticamente cuando usas \"Marcar como Enviado\", o puedes configurarlas individualmente al editar una entrada de plataforma. Esto te ayuda a rastrear qué distribuidor gestionó cada plataforma, especialmente si usas diferentes distribuidores para distintos territorios o plataformas.",
        "warning": "Las analíticas solo reflejan los datos que has registrado en Mix Architect. Si envías a través del panel de tu distribuidor, recuerda actualizar el estado aquí para que tu seguimiento se mantenga preciso.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Analíticas de Usuario",
    "category": "releases",
    "summary": "Consulta tus lanzamientos completados, tiempo medio de entrega, ingresos totales y desglose por cliente en el panel de Analíticas.",
    "tags": [
      "analytics",
      "dashboard",
      "revenue",
      "turnaround",
      "velocity",
      "clients",
      "charts"
    ],
    "updatedAt": "2026-03-14",
    "content": [
      {
        "heading": "Qué Muestra la Página de Analíticas",
        "body": "Accede a la página de [Analíticas](/app/analytics) desde la barra lateral. El panel muestra cuatro tarjetas resumen en la parte superior: Lanzamientos Completados (total de proyectos finalizados con media mensual), Tiempo Medio de Entrega (días desde la creación hasta la finalización, con desglose del más rápido y más lento), Ingresos Totales (suma de todos los honorarios registrados con saldo pendiente) y Clientes (número de clientes únicos con total de lanzamientos). Debajo de las tarjetas resumen, tres gráficos visualizan tus datos a lo largo del tiempo, y una tabla de desglose por cliente muestra estadísticas individuales.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Velocidad de Lanzamiento y Tiempo de Entrega",
        "body": "El gráfico de Velocidad de Lanzamiento es un gráfico de barras que muestra cuántos lanzamientos completaste cada mes dentro del rango de fechas seleccionado. Las barras más altas indican meses más productivos. Úsalo para detectar tendencias en tu producción e identificar periodos de alta o baja actividad. El gráfico de Tiempo de Entrega muestra el número medio de días desde la creación del lanzamiento hasta su finalización por mes. Las barras más bajas significan entregas más rápidas. Juntos, estos gráficos te ayudan a entender tu capacidad y si tu flujo de trabajo se está acelerando o ralentizando con el tiempo.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Gráfico de Ingresos",
        "body": "El gráfico de Ingresos es un gráfico de área que muestra los honorarios totales ganados por mes. Registra los importes de pago anotados en tus lanzamientos, por lo que refleja lo que los clientes han pagado realmente. Úsalo para ver tendencias de ingresos, identificar tus meses más rentables y planificar para periodos más tranquilos. Los datos de ingresos provienen de la función de seguimiento de pagos en cada lanzamiento, así que asegúrate de que los honorarios y estados de pago estén actualizados para obtener informes precisos.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Desglose por Cliente",
        "body": "La tabla de Desglose por Cliente en la parte inferior de la página de Analíticas lista cada cliente con sus métricas clave: número de lanzamientos, ingresos totales, importe pagado y tiempo medio de entrega. Esto te ayuda a identificar qué clientes generan más trabajo e ingresos, quién paga a tiempo y dónde se invierte tu tiempo. Haz clic en cualquier fila de cliente para ver sus lanzamientos. La tabla se ordena por ingresos por defecto.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Selector de Rango de Fechas",
        "body": "Usa el selector de rango de fechas en la esquina superior derecha para controlar qué periodo cubren las analíticas. Los rangos predefinidos incluyen Últimos 7 Días, Últimos 30 Días, Últimos 90 Días y Últimos 365 Días. También puedes establecer un rango personalizado seleccionando fechas de inicio y fin específicas. Las cuatro tarjetas resumen y los tres gráficos se actualizan para reflejar el periodo seleccionado. El selector de rango de fechas funciona de la misma manera en todo el panel de analíticas.",
        "tip": "Usa el rango de 365 días para revisiones anuales y preparación fiscal. El rango de 30 días es útil para revisiones mensuales del estado de tu negocio.",
        "mockup": "analytics-date-range"
      }
    ]
  },
  {
    "id": "upload-audio-tracks",
    "title": "Subir y Gestionar Audio",
    "category": "audio",
    "summary": "Cómo subir archivos de audio, gestionar versiones y usar el reproductor de forma de onda.",
    "tags": [
      "upload",
      "tracks",
      "audio",
      "versions",
      "waveform"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Subir Audio",
        "body": "Abre cualquier pista y ve a la pestaña Audio. Haz clic en el área de subida o arrastra y suelta un archivo directamente sobre ella. Formatos soportados: WAV, AIFF, FLAC, MP3, AAC y M4A, hasta 500 MB por archivo. El archivo se sube a almacenamiento seguro en la nube, y se genera automáticamente una visualización de forma de onda. Los metadatos del archivo (formato, frecuencia de muestreo, profundidad de bits, duración) se capturan y muestran debajo de la información de versión, por ejemplo: \"Typical Wonderful 2025-10-10 MGO.wav, WAV, 48kHz, 24-bit\".",
        "mockup": "audio-upload"
      },
      {
        "heading": "Versiones de Pista",
        "body": "Cada vez que subes un nuevo archivo a la misma pista, se convierte en la siguiente versión. El selector de versión encima de la forma de onda muestra botones numerados (v1, v2, v3, etc.) más un botón + para subir otra versión. Haz clic en cualquier versión para cambiar a ella. Cada versión muestra su número de versión, fecha de subida, recuento de comentarios y un icono de descarga para descargar el archivo original. Las versiones anteriores se preservan completamente con sus propios comentarios y forma de onda.",
        "tip": "Sube mezclas revisadas a la misma pista en lugar de crear una nueva pista. Esto mantiene tu historial de versiones limpio, preserva comentarios en versiones anteriores y te permite comparar mezclas a lo largo del tiempo.",
        "mockup": "track-versions"
      },
      {
        "heading": "Reproductor de Forma de Onda",
        "body": "Cada versión subida muestra una forma de onda interactiva. Haz clic en cualquier lugar de la forma de onda para buscar esa posición. Los controles de transporte debajo de la forma de onda incluyen: tiempo actual, interruptor de bucle, saltar atrás, reproducir/pausa, saltar adelante, interruptor de repetir y duración total. El reproductor también muestra una medición de sonoridad LUFS integrada (ej. \"-14.8 LUFS\") junto a los metadatos del archivo, codificada por colores contra objetivos de sonoridad para que puedas evaluar niveles de un vistazo. Si hay comentarios con marca de tiempo en la versión actual, pequeños iconos marcadores aparecen en la forma de onda en sus posiciones.",
        "mockup": "track-tab-audio"
      }
    ]
  },
  {
    "id": "audio-converter",
    "title": "Formatos de Entrega y Conversión",
    "category": "audio",
    "summary": "Configura formatos de entrega, convierte audio e incrusta automáticamente etiquetas de metadatos como artista, portada, ISRC y letras.",
    "tags": [
      "convert",
      "export",
      "format",
      "delivery",
      "wav",
      "mp3",
      "flac",
      "aiff",
      "specs",
      "metadata",
      "tags",
      "isrc",
      "lyrics",
      "cover art",
      "replaygain"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Establecer Formatos de Entrega",
        "body": "Abre cualquier pista y ve a la pestaña Especificaciones. Desplázate hasta la sección Entrega. Aquí seleccionas qué formatos de salida necesita tu proyecto haciendo clic en las fichas de formato. Formatos convertibles disponibles: WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos seleccionados aparecen resaltados en verde con un icono de marca de verificación. Formatos adicionales no convertibles (DDP, ADM BWF/Atmos, MQA) pueden activarse para referencia, muestran un tooltip informativo explicando que la conversión automática no está disponible. También puedes escribir un nombre de formato personalizado en el campo \"Formato personalizado...\" y hacer clic en \"+ Añadir\" para cualquier formato no listado. Usa el desplegable \"Exportar desde\" para elegir desde qué versión de audio convertir, como \"v3 - filename.wav (última)\".",
        "mockup": "format-convert"
      },
      {
        "heading": "Convertir y Descargar",
        "body": "Selecciona qué formatos deberían estar disponibles haciendo clic en las fichas de formato en la sección Entrega: los formatos convertibles incluyen WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos seleccionados aparecen resaltados en verde con una marca de verificación. Haz clic en el icono de flecha de descarga junto a cualquier formato convertible seleccionado para iniciar una conversión. El icono muestra un spinner mientras la conversión se procesa en segundo plano. Cuando la conversión se completa, el archivo se descarga automáticamente a tu navegador. Cada conversión usa la versión de audio que seleccionaste en el desplegable \"Exportar desde\", convirtiendo desde el archivo original subido para preservar la máxima calidad de audio. Los formatos sin pérdida (WAV, AIFF, FLAC, ALAC) preservan la frecuencia de muestreo y profundidad de bits del archivo fuente. Los formatos con pérdida usan ajustes preestablecidos optimizados: MP3 exporta a 44.1 kHz / 320 kbps, AAC a 44.1 kHz / 256 kbps y OGG a 44.1 kHz / Calidad 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Incrustación Automática de Metadatos",
        "body": "Cuando conviertes a MP3, FLAC, AAC, OGG o ALAC, Mix Architect escribe automáticamente etiquetas de metadatos estándar de la industria en el archivo de salida. Esto incluye: artista, título, álbum, número de pista, género, año de lanzamiento, copyright, ISRC, UPC/código de barras, letras, portada y ReplayGain. ReplayGain es una etiqueta de sonoridad que dice a reproductores compatibles cuánto ajustar el volumen para que las pistas se reproduzcan a un nivel consistente sin recorte. Mix Architect lo calcula desde los LUFS medidos de tu audio usando el estándar ReplayGain 2.0 (nivel de referencia de -18 LUFS). Los archivos MP3 obtienen etiquetas ID3v2, FLAC y OGG usan comentarios Vorbis, y AAC/ALAC usan átomos MP4 estilo iTunes. Todos los metadatos se extraen de los detalles de tu lanzamiento y pista (incluyendo la pestaña Distribución para ISRC y letras, y la portada del lanzamiento). Las exportaciones WAV y AIFF no incluyen etiquetas de metadatos. Después de que una conversión se completa, pasa el ratón sobre el icono de etiqueta junto a la ficha de formato para ver exactamente qué etiquetas se incrustaron.",
        "tip": "Rellena tu pestaña Distribución (ISRC, letras) y sube portada antes de exportar. Cuantos más metadatos proporciones, más completos serán tus archivos exportados para distribución."
      },
      {
        "heading": "Referencia de Formatos Soportados",
        "body": "Los formatos sin pérdida preservan la calidad fuente: WAV (PCM, tasa/profundidad fuente), AIFF (PCM, tasa/profundidad fuente), FLAC (tasa fuente), ALAC (tasa fuente). Los formatos con pérdida usan ajustes preestablecidos fijos optimizados para distribución: MP3 (44.1 kHz, 320 kbps, estéreo), AAC (44.1 kHz, 256 kbps, estéreo), OGG Vorbis (44.1 kHz, calidad 8, estéreo). Formatos no convertibles (solo etiqueta, sin auto-conversión): DDP, ADM BWF (Atmos), MQA. La Configuración Técnica (frecuencia de muestreo y profundidad de bits) en la parte superior de la pestaña Especificaciones son metadatos de referencia describiendo el audio fuente, no controlan la salida de conversión. El área de texto Requisitos Especiales debajo de los formatos de entrega te permite añadir notas sobre instrucciones de entrega.",
        "warning": "Convertir desde un formato con pérdida (MP3, AAC, OGG) a un formato sin pérdida (WAV, FLAC) no mejora la calidad de audio. Los artefactos de compresión originales permanecen. Siempre sube tu archivo fuente de mayor calidad.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Dejar Comentarios con Marca de Tiempo",
    "category": "audio",
    "summary": "Añade comentarios codificados por tiempo directamente en la forma de onda para que los colaboradores sepan exactamente dónde escuchar.",
    "tags": [
      "comments",
      "feedback",
      "review",
      "timestamp",
      "waveform",
      "notes"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Añadir un Comentario",
        "body": "Abre una pista y ve a la pestaña Audio. Haz doble clic en la forma de onda en el punto exacto que quieres referenciar. Aparece una entrada de texto en la sección Comentarios debajo de la forma de onda donde puedes escribir tu comentario. El comentario se ancla a ese código de tiempo y versión. En la sección Comentarios, cada comentario muestra el nombre del autor, una insignia de marca de tiempo coloreada (ej. \"0:07\" o \"1:22\"), la fecha relativa y el texto del mensaje. Los marcadores de comentarios también aparecen como pequeños iconos directamente en la forma de onda en sus posiciones. Haz clic en cualquier marca de tiempo para saltar la cabeza de reproducción a ese momento.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Comentarios del Portal",
        "body": "Los clientes revisando a través del portal también pueden dejar comentarios con marca de tiempo en la forma de onda. Sus comentarios aparecen en la misma sección Comentarios junto a los comentarios del equipo pero se distinguen visualmente con una insignia \"Cliente\" para que puedas identificar rápidamente comentarios externos. Esto mantiene todos los comentarios, internos y externos, organizados en un lugar bajo la versión de audio relevante.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notas vs Comentarios de Audio",
        "body": "La pestaña Audio es para comentarios con marca de tiempo atados a momentos específicos en la forma de onda: \"sube las voces en 1:22\" o \"la caja está muy alta aquí\". La pestaña Notas es para discusión general y notas de revisión que no están atadas a un código de tiempo: \"en general la mezcla necesita más graves\" o \"el cliente quiere un enfoque más agresivo\". Los comentarios de Audio son específicos de versión (atados a v1, v2, etc.), mientras las Notas se aplican a la pista en su conjunto. Usa la pestaña Intención para documentar la visión creativa general, etiquetas emocionales y pistas de referencia.",
        "tip": "Para una imagen completa de los comentarios en una pista, revisa tanto la sección Comentarios de la pestaña Audio (para notas específicas de tiempo) como la pestaña Notas (para discusión general). Los comentarios del cliente pueden aparecer en cualquiera de los dos lugares.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Usar la Vista Cronología",
    "category": "timeline",
    "summary": "Cambia a vista cronología en tu panel de control para visualizar horarios de lanzamiento y cuenta atrás hasta fechas de lanzamiento.",
    "tags": [
      "timeline",
      "schedule",
      "calendar",
      "planning",
      "release date"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Cambiar a Vista Cronología",
        "body": "En el [Panel de control](/app), busca los dos botones de cambio de vista en el área del encabezado (debajo de las estadísticas de pago). Haz clic en el icono de cronología (el segundo botón) para cambiar de vista cuadrícula a vista cronología. La cronología muestra tus lanzamientos cronológicamente basándose en sus fechas objetivo de lanzamiento. Los lanzamientos sin fecha objetivo aparecen en una sección separada \"Sin programar\" en la parte inferior. Tu preferencia de vista se guarda automáticamente, así que el panel de control recordará tu elección la próxima vez que visites.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Leer la Cronología",
        "body": "Cada lanzamiento aparece como una tarjeta posicionada por su fecha objetivo de lanzamiento. La cronología muestra una cuenta atrás: \"X días hasta el lanzamiento\" para fechas futuras o \"Lanzado hace X días\" para fechas pasadas. Las tarjetas de lanzamiento muestran la misma información que la vista cuadrícula (título, artista, estado, formato, recuento de pistas) más el contexto de programación. Los puntos de estado están codificados por colores: naranja para Borrador, azul para En progreso y verde para Listo. Los lanzamientos fijados aparecen en la parte superior de la cronología.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Establecer Fechas Objetivo",
        "body": "Para añadir un lanzamiento a la cronología, establece una fecha objetivo de lanzamiento ya sea al crear el lanzamiento o en Configuración del Lanzamiento (icono de engranaje en la página del lanzamiento). El campo Fecha Objetivo de Lanzamiento usa un selector de fecha. La cronología se actualiza automáticamente cuando ajustas fechas. Esto te ayuda a visualizar tu horario y evitar ventanas de lanzamiento superpuestas a través de múltiples proyectos.",
        "tip": "Usa la vista cronología durante la planificación para espaciar tus lanzamientos. Tener visibilidad clara de fechas límite próximas ayuda a prevenir cuellos de botella en tu flujo de trabajo de mezcla, masterización o distribución.",
        "mockup": "timeline-dates"
      }
    ]
  },
  {
    "id": "export-data",
    "title": "Exportar los Datos de tu Cuenta",
    "category": "account",
    "summary": "Descarga una exportación ZIP completa de tus lanzamientos, pistas, archivos de audio y registros de pago.",
    "tags": [
      "export",
      "data",
      "download",
      "backup",
      "privacy",
      "zip"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Qué se Incluye",
        "body": "La exportación de datos es un archivo ZIP que contiene todos tus metadatos de lanzamiento, detalles de pistas, archivos de audio (todas las versiones) y registros de pago. Antes de descargar, la aplicación muestra una estimación del tamaño de exportación junto con recuentos: número de lanzamientos, pistas y archivos de audio incluidos. Esto te da una copia de seguridad completa de todo en tu cuenta.",
        "mockup": "export-contents"
      },
      {
        "heading": "Iniciar una Exportación",
        "body": "Ve a [Configuración](/app/settings) y desplázate hasta la sección \"Tus Datos\". Haz clic en \"Exportar Mis Datos\" para comenzar. La aplicación primero calcula una estimación mostrando el tamaño aproximado del archivo y recuentos (ej. \"3 lanzamientos, 12 pistas, 8 archivos de audio\"). Revisa la estimación, luego haz clic en \"Descargar\" para iniciar la exportación. Una barra de progreso muestra el estado de descarga. Para cuentas grandes con muchos archivos de audio, la exportación puede tomar un tiempo. El archivo ZIP se descarga a tu navegador automáticamente cuando se completa. Puedes hacer clic en \"Cancelar\" para volver atrás sin descargar.",
        "mockup": "export-progress"
      },
      {
        "heading": "Privacidad de Datos",
        "body": "Tu exportación contiene solo datos que posees o has creado. Las contribuciones de colaboradores (como comentarios en tus lanzamientos) se incluyen, pero los datos privados de otros usuarios no. La exportación se genera bajo demanda y no se almacena en nuestros servidores después de la descarga.",
        "tip": "Ejecuta una exportación de datos periódicamente como copia de seguridad de tus proyectos y archivos de audio. Esto es especialmente útil antes de hacer cambios importantes en tu cuenta.",
        "mockup": "export-privacy"
      }
    ]
  },
  {
    "id": "manage-subscription",
    "title": "Gestionar tu Suscripción Pro",
    "category": "billing",
    "summary": "Ve tu plan, actualiza detalles de pago y gestiona tu suscripción Pro a través de Stripe.",
    "tags": [
      "subscription",
      "pro",
      "billing",
      "payment",
      "plan"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Ver tu Plan",
        "body": "Ve a [Configuración](/app/settings) y desplázate hasta la sección Suscripción en la parte inferior. La sección dice \"Gestiona tu plan de Mix Architect.\" Verás tu plan actual: las cuentas Pro muestran \"$14/mes, Lanzamientos ilimitados\" con una insignia verde \"PRO\" y un botón \"Gestionar Facturación\". Las cuentas gratuitas muestran un botón \"Actualizar a Pro\" en su lugar.",
        "mockup": "plan-current"
      },
      {
        "heading": "Actualizar a Pro",
        "body": "Desde la página [Configuración](/app/settings), haz clic en \"Actualizar a Pro\" en la sección Suscripción. Serás llevado a una página segura de checkout de Stripe. Una vez confirmado el pago, tu cuenta se actualiza inmediatamente y obtienes acceso a todas las funciones Pro, incluyendo lanzamientos ilimitados y conversión de audio. La insignia Pro aparece junto a la información de tu plan.",
        "mockup": "upgrade-pro"
      },
      {
        "heading": "Gestionar Pago",
        "body": "Haz clic en \"Gestionar Facturación\" en la sección Suscripción de [Configuración](/app/settings) para abrir el portal de facturación de Stripe. Desde ahí puedes actualizar tu método de pago, ver facturas y descargar recibos. Todo el procesamiento de pagos se maneja de forma segura por Stripe.",
        "mockup": "manage-payment"
      }
    ]
  },
  {
    "id": "cancel-resubscribe",
    "title": "Cancelar y Resubscribirse",
    "category": "billing",
    "summary": "Cómo cancelar tu suscripción Pro y qué pasa con tus datos.",
    "tags": [
      "cancel",
      "resubscribe",
      "downgrade",
      "billing"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Cancelar tu Suscripción",
        "body": "Haz clic en \"Gestionar Facturación\" en la sección Suscripción de [Configuración](/app/settings) para abrir el portal de Stripe, luego haz clic en \"Cancelar plan\". Tu acceso Pro continúa hasta el final de tu período de facturación actual. Un aviso en [Configuración](/app/settings) mostrará cuándo expira tu plan Pro para que sepas exactamente cuánto dura tu acceso.",
        "mockup": "cancel-subscription"
      },
      {
        "heading": "Qué Pasa con tus Datos",
        "body": "Todos tus lanzamientos, pistas, archivos de audio, comentarios y registros de pago se preservan completamente. No pierdes nada al degradar. Sin embargo, las funciones Pro (como lanzamientos ilimitados y conversión de audio) se volverán no disponibles hasta que te resubscribas. Tus lanzamientos existentes permanecen accesibles.",
        "warning": "Las cuentas gratuitas están limitadas a un lanzamiento activo. Si tienes más de un lanzamiento cuando tu plan Pro expire, tus lanzamientos existentes se preservan pero no podrás crear nuevos lanzamientos hasta que te resubscribas o reduzcas a un lanzamiento.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Resubscribirse",
        "body": "Para reactivar Pro, ve a la sección Suscripción en [Configuración](/app/settings) y haz clic en \"Actualizar a Pro\" otra vez, o usa \"Gestionar Facturación\" para resubscribirte a través del portal de Stripe. Tus datos anteriores, configuración, plantillas y configuraciones de equipo están todos intactos e inmediatamente disponibles.",
        "mockup": "resubscribe"
      }
    ]
  }
];
