import type { HelpArticle } from "./types";

export const articles: HelpArticle[] = [
  {
    "id": "getting-started-overview",
    "title": "Bienvenido a Mix Architect",
    "category": "getting-started",
    "summary": "Un recorrido rápido por la plataforma: tu tablero, lanzamientos, pistas y herramientas de colaboración.",
    "tags": [
      "overview",
      "intro",
      "dashboard",
      "getting started"
    ],
    "updatedAt": "2026-03-04",
    "content": [
      {
        "heading": "Tu Tablero",
        "body": "Después de iniciar sesión llegas al [Tablero](/app). Muestra todos tus lanzamientos en una cuadrícula responsiva, ordenados por la actividad más reciente. Cada tarjeta de lanzamiento muestra su portada, título, nombre del artista, punto de estado (codificado por colores para Borrador, En Progreso o Listo), píldora de tipo de lanzamiento (Sencillo, EP o Álbum), píldora de formato (Estéreo, Dolby Atmos o Estéreo + Atmos) y un conteo de finalización de pistas como \"1 de 6 pistas briefeadas\". Si el [seguimiento de pagos](/app/settings) está habilitado, también verás estadísticas de resumen de pagos en la parte superior: Pendientes, Ganados y Tarifas totales en todos los lanzamientos, con un enlace \"Ver todo\" a la página de [Pagos](/app/payments). Usa el ícono de pin en cualquier tarjeta de lanzamiento para anclarla en la parte superior de tu tablero, y el menú de tres puntos para acciones rápidas. El menú desplegable de ordenamiento te permite ordenar lanzamientos por Última Modificación, Título o Fecha de Creación.",
        "mockup": "dashboard"
      },
      {
        "heading": "Vista de Cuadrícula vs Cronograma",
        "body": "El encabezado del tablero tiene dos botones de alternancia de vista: Cuadrícula y Cronograma. La vista de Cuadrícula (la predeterminada) muestra tus lanzamientos como tarjetas en una cuadrícula responsiva. La vista de Cronograma organiza los lanzamientos cronológicamente basándose en sus fechas objetivo de lanzamiento, mostrando cuentas regresivas e información de programación. Tu preferencia de vista se guarda automáticamente. Conoce más en [Usar la Vista de Cronograma](/app/help?article=timeline-overview)."
      },
      {
        "heading": "Navegar la App",
        "body": "La barra lateral (escritorio) o barra inferior (móvil) te da acceso rápido a cada sección de la app: [Tablero](/app) para tus lanzamientos, Buscar (o Cmd+K / Ctrl+K) para saltar a cualquier lanzamiento o pista al instante, [Plantillas](/app/templates) para presets de lanzamiento reutilizables, [Pagos](/app/payments) para seguimiento de tarifas (si está habilitado), [Configuración](/app/settings) para tu perfil, valores predeterminados y suscripción, y [Ayuda](/app/help) para documentación. La barra lateral también incluye Notificaciones para actualizaciones de actividad, Auto para funciones de automatización, y Cerrar Sesión. El cambio de tema entre modos Claro, Oscuro y Sistema está disponible en [Configuración](/app/settings) bajo Apariencia.",
        "tip": "Presiona Cmd+K (Mac) o Ctrl+K (Windows) desde cualquier lugar en la app para buscar instantáneamente y saltar a cualquier lanzamiento o pista.",
        "mockup": "nav-rail"
      },
      {
        "heading": "Conceptos Clave",
        "body": "Los lanzamientos son tus proyectos de nivel superior (álbumes, EPs o sencillos). Cada lanzamiento contiene una o más pistas. En escritorio, la página de detalle del lanzamiento tiene un diseño de dos columnas: la lista de pistas a la izquierda y una barra lateral de inspector a la derecha mostrando la portada, Información del Lanzamiento (artista, tipo, formato, estado, fecha objetivo, género), Dirección Global de Mezcla, Referencias Globales y estado de Pago. Cada pista tiene seis pestañas: Intención, Especificaciones, Audio, Distribución, Portal y Notas. Haz clic en el ícono de engranaje de configuración en el encabezado del lanzamiento para abrir Configuración del Lanzamiento, donde puedes editar todos los metadatos, gestionar tu equipo y configurar el pago. El encabezado también tiene botones para la alternancia del Portal (con un enlace para abrir el portal), Guardar como Plantilla y el engranaje de configuración.",
        "mockup": "key-concepts"
      }
    ]
  },
  {
    "id": "create-first-release",
    "title": "Crear tu Primer Lanzamiento",
    "category": "getting-started",
    "summary": "Guía paso a paso para crear un lanzamiento, agregar portada, subir pistas y configurar tu estado.",
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
        "body": "Desde el [Tablero](/app), haz clic en el botón \"+ Nuevo Lanzamiento\" en la esquina superior derecha. Si tienes [plantillas](/app/templates) guardadas, se muestra primero un selector de plantillas donde puedes seleccionar una plantilla o hacer clic en \"Empezar desde cero\". El formulario de creación pide un título, un nombre opcional de artista/cliente, tipo de lanzamiento (Sencillo, EP o Álbum), formato (Estéreo, Dolby Atmos o Estéreo + Atmos), etiquetas de género (elige de sugerencias como Rock, Pop, Hip-Hop, Electrónica, etc. o agrega las tuyas), y una fecha objetivo de lanzamiento.",
        "tip": "Cuando creas un Sencillo, se crea automáticamente una pista con el título del lanzamiento y tus especificaciones predeterminadas de [Configuración](/app/settings) aplicadas.",
        "mockup": "create-release"
      },
      {
        "heading": "La Página de Detalle del Lanzamiento",
        "body": "Después de la creación, llegas a la página de detalle del lanzamiento. En escritorio esto tiene un diseño de dos columnas: la lista de pistas a la izquierda con un botón \"Flujo\" y botón \"+ Agregar Pista\", y una barra lateral de inspector a la derecha. La barra lateral del inspector muestra la portada, Información del Lanzamiento (Artista, Tipo, Formato, Estado, Fecha Objetivo, Género), Dirección Global de Mezcla (haz clic en el ícono de lápiz para actualizar) y Referencias Globales (haz clic en \"+ Agregar\" para buscar y agregar pistas de referencia). Si el seguimiento de pagos está habilitado, la sección de Pago aparece en la parte inferior de la barra lateral. Para agregar o cambiar la portada, haz clic en el ícono de lápiz en la obra de arte en la barra lateral. Esto revela opciones debajo de la imagen: un botón Subir para elegir un archivo, un botón Remover (si ya existe arte) y un campo \"O pegar URL\" para enlazar una imagen directamente. Los nuevos lanzamientos muestran un área de subida punteada con \"Haz clic para subir\" (JPEG o PNG, mín 1400x1400). Para editar otros metadatos del lanzamiento, haz clic en el ícono de engranaje de configuración en el encabezado para abrir Configuración del Lanzamiento.",
        "mockup": "cover-art-upload"
      },
      {
        "heading": "Agregar Pistas",
        "body": "En la vista de detalle del lanzamiento, haz clic en \"+ Agregar Pista\" en el encabezado junto al botón Flujo. Dale un título a tu pista y se creará con tus especificaciones predeterminadas de [Configuración](/app/settings) aplicadas. Cada pista aparece en la lista con un número, título, vista previa de intención, punto de estado y distintivo de aprobación. Puedes arrastrar pistas para reordenarlas usando el mango de agarre a la izquierda, o usar los botones de subir/bajar. Elimina pistas con el ícono de papelera a la derecha. Haz clic en cualquier pista para abrirla y comenzar a trabajar en sus seis pestañas.",
        "mockup": "track-upload"
      },
      {
        "heading": "Establecer Estado del Lanzamiento",
        "body": "Cada lanzamiento tiene un estado: Borrador, En Progreso o Listo. Puedes cambiar el estado desde la barra lateral del inspector haciendo clic en el distintivo de estado junto a \"Estado\" en la sección Información del Lanzamiento, o desde Configuración del Lanzamiento (ícono de engranaje). Un lanzamiento cambia automáticamente a En Progreso una vez que se ha comenzado el trabajo en él (por ejemplo, subir audio o agregar pistas). El color del distintivo de estado aparece en las tarjetas de lanzamiento de tu [Tablero](/app) (naranja para Borrador, azul para En Progreso, verde para Listo) y es visible para todos los colaboradores y en el portal del cliente.",
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
        "body": "Abre un lanzamiento y haz clic en el ícono de engranaje de configuración en el encabezado para ir a Configuración del Lanzamiento. Desplázate hacia abajo pasando los metadatos del lanzamiento hasta la sección Equipo en la parte inferior. Ingresa la dirección de correo electrónico de la persona que quieres invitar, selecciona su rol del menú desplegable (Colaborador o Cliente) y haz clic en \"Invitar\". Recibirán un correo electrónico con un enlace para unirse al lanzamiento. Los miembros activos del equipo aparecen debajo del formulario de invitación con su correo electrónico, distintivo de rol, estado y un botón eliminar para removerlos.",
        "mockup": "invite-collaborator"
      },
      {
        "heading": "Roles de Colaborador vs Cliente",
        "body": "Hay dos roles. Los Colaboradores tienen acceso completo para ver y editar todo el contenido del lanzamiento: pistas, intención, especificaciones, audio, notas, metadatos de distribución y configuración del lanzamiento. Los Clientes tienen acceso de solo lectura a través del portal del cliente y pueden proporcionar retroalimentación a través de comentarios, aprobar o solicitar cambios en pistas individuales, y descargar archivos de audio si se permite. El distintivo de rol se muestra junto al correo electrónico de cada miembro del equipo en la sección Equipo.",
        "mockup": "collaborator-roles"
      },
      {
        "heading": "Aceptar Invitaciones",
        "body": "Cuando alguien hace clic en el enlace de invitación y se une al lanzamiento, aparece en la lista de Equipo con su distintivo de rol y estado \"Activo\". Recibirás una notificación en la app informándote que se han unido. Los invitados que no tienen una cuenta de Mix Architect serán solicitados a crear una cuando hagan clic en el enlace de invitación.",
        "tip": "Puedes remover un miembro del equipo en cualquier momento haciendo clic en el ícono de papelera junto a su nombre en la sección Equipo de Configuración del Lanzamiento.",
        "mockup": "accept-invitation"
      },
      {
        "heading": "Compartir Portal del Cliente",
        "body": "Para partes interesadas externas que necesitan revisar sin iniciar sesión, activa el portal del cliente desde el encabezado de la página de detalle del lanzamiento. Haz clic en la alternancia del Portal para activarla (la alternancia se vuelve verde cuando está activa), luego usa el ícono de enlace junto a la alternancia para copiar la URL única de compartir. El portal proporciona acceso de solo lectura al resumen del lanzamiento, lista de pistas, reproducción de audio y comentarios. Puedes configurar exactamente qué es visible usando la configuración del portal: dirección de mezcla, especificaciones, referencias, estado de pago, información de distribución y letras. Para control por pista, usa la pestaña Portal en cada pista.",
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
        "body": "La pestaña Intención es donde describes la visión creativa para una pista. En la parte superior hay un área de texto libre bajo \"¿Cómo debería sentirse esta pista?\" donde puedes escribir la dirección de la mezcla (haz clic en \"Editar\" para modificar). Debajo, la sección Cualidades Emocionales te permite etiquetar la pista con palabras descriptivas: las etiquetas seleccionadas aparecen como píldoras llenas (ej. espacioso, cálido, contundente, nostálgico), y las sugerencias disponibles aparecen como píldoras de contorno que puedes hacer clic para agregar (agresivo, íntimo, áspero, pulido, oscuro, brillante, crudo, exuberante, soñador, lo-fi, cinematográfico, minimalista, denso, etéreo, hipnótico, eufórico, melancólico, orgánico, sintético, caótico, suave, inquietante, juguetón, himno, delicado, pesado, aireado). La sección Anti-Referencias en la parte inferior te permite describir sonidos o enfoques que quieres evitar. En la barra lateral derecha, Vista Rápida muestra el estado de la pista, calidad de audio (frecuencia de muestreo / profundidad de bits) y formato de un vistazo. Debajo, la sección Referencias te permite buscar y agregar pistas de referencia (de Apple Music) con notas opcionales describiendo qué referenciar sobre cada una.",
        "mockup": "track-tab-intent"
      },
      {
        "heading": "Especificaciones",
        "body": "La pestaña Especificaciones contiene las especificaciones técnicas para tu pista. La sección Configuración Técnica tiene tres menús desplegables: Formato (Estéreo, Dolby Atmos o Estéreo + Atmos), Frecuencia de Muestreo (44.1kHz, 48kHz, 88.2kHz, 96kHz) y Profundidad de Bits (16-bit, 24-bit, 32-bit float). Estos valores son metadatos de referencia que describen el audio fuente y se usan como valores predeterminados para nuevas pistas creadas desde plantillas, no se usan para controlar la salida de conversión. Debajo, la sección Entrega gestiona tus formatos de salida. Selecciona qué formatos deberían estar disponibles haciendo clic en los chips de formato: los formatos convertibles incluyen WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos no convertibles (DDP, ADM BWF/Atmos, MQA) pueden seleccionarse para referencia pero muestran un tooltip informativo explicando que no pueden ser auto-convertidos. Los formatos seleccionados aparecen resaltados en verde con una marca de verificación. Usa el menú desplegable \"Exportar desde\" para elegir de qué versión de audio convertir (ej. \"v3 - Typical Wonderful 2025-10-10 MGO.wav (último)\"). Haz clic en el ícono de flecha de descarga junto a cualquier formato convertible seleccionado para iniciar una conversión. También puedes escribir un nombre de formato personalizado en el campo \"Formato personalizado...\" y hacer clic en \"+ Agregar\". En la parte inferior, el área de texto Requisitos Especiales te permite anotar cualquier instrucción específica de entrega.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Audio",
        "body": "La pestaña Audio es donde subes archivos, gestionas versiones y reproduces audio. El encabezado muestra el nombre del lanzamiento y la pista con la portada del álbum. El selector de versión (v1, v2, v3, etc.) te permite cambiar entre revisiones, haz clic en el botón + para subir una nueva versión. Cada versión muestra su número de versión, fecha de subida, conteo de comentarios y un botón de descarga. La visualización de forma de onda muestra el audio con reproducción interactiva: haz clic en cualquier lugar para buscar, y usa los controles de transporte debajo (bucle, retroceder, reproducir/pausar, avanzar, repetir). La medición de sonoridad LUFS se muestra junto a los metadatos del archivo (formato, frecuencia de muestreo, profundidad de bits), codificado por colores contra objetivos de sonoridad. La sección Retroalimentación debajo de la forma de onda muestra todos los comentarios con marca de tiempo para la versión actual. Haz doble clic en cualquier lugar de la forma de onda para agregar un nuevo comentario en ese código de tiempo. Los marcadores de comentarios aparecen como pequeños íconos en la forma de onda en sus posiciones respectivas.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Análisis de Sonoridad (LUFS)",
        "body": "Cuando subes audio, Mix Architect mide automáticamente la sonoridad integrada en LUFS (Unidades de Sonoridad Escala Completa). Haz clic en la lectura LUFS junto a los metadatos de la versión para expandir el panel de Análisis de Sonoridad. Esto muestra cómo cada servicio principal de streaming, estándar de transmisión y plataforma social ajustará tu pista durante la reproducción. Cada fila muestra el nombre de la plataforma, su sonoridad objetivo (ej. Spotify apunta a -14 LUFS) y el cambio de ganancia que se aplicaría a tu archivo. Un valor positivo significa que el servicio subirá tu pista, un valor negativo (mostrado en naranja) significa que se bajará. Por ejemplo, si tu mezcla mide -14.9 LUFS, Spotify aplicaría +0.9 dB mientras que Apple Music (objetivo -16) aplicaría -1.1 dB. El panel está agrupado en Streaming (Spotify, Apple Music, YouTube, Tidal, Amazon Music, Deezer, Qobuz, Pandora), Transmisión (EBU R128, ATSC A/85, ITU-R BS.1770) y Social (Instagram/Reels, TikTok, Facebook). Usa esto para verificar si tu master será alterado significativamente en alguna plataforma antes de la entrega.",
        "mockup": "track-tab-lufs"
      },
      {
        "heading": "Distribución",
        "body": "La pestaña Distribución captura todos los metadatos necesarios para distribución digital. Incluye tres secciones divididas, cada una con botones \"+ Agregar Persona\": División de Escritura (nombre de la persona, porcentaje, afiliación PRO como ASCAP/BMI, número de Cuenta de Miembro y número IPI de Escritor), División de Publicación (nombre del editor, porcentaje, ID de Miembro Editor e IPI de Editor) y División de Grabación Master (nombre de entidad y porcentaje). El total corriente para cada sección de división se muestra en verde cuando es igual a 100% o naranja cuando no lo es. Debajo de las divisiones: Códigos e Identificadores (campos ISRC e ISWC), Créditos (nombres de productor y compositor/letrista), Propiedades de Pista (artista destacado, selector de idioma, alternadores para letras explícitas, instrumental y canción de cover), Copyright (número de registro y fecha de copyright) y Letras (área de texto de letras completas).",
        "mockup": "track-tab-distribution"
      },
      {
        "heading": "Portal",
        "body": "La pestaña Portal controla cómo los clientes interactúan con esta pista específica. En la parte superior, la sección Aprobación del Cliente muestra el estado actual de aprobación (ej. \"Aprobado\" en verde) junto con un historial con marca de tiempo de todos los eventos de aprobación: aprobado, cambios solicitados (con la nota del cliente), reabierto para revisión y re-aprobado, cada uno con fechas. Debajo, Visibilidad del Portal de Pista te permite alternar si esta pista es visible en el portal, si las descargas están habilitadas, y qué versiones específicas de audio (Versión 1, Versión 2, Versión 3, etc.) puede acceder el cliente, cada una con su propio interruptor de alternancia. Una nota en la parte inferior te recuerda que la activación del portal y el enlace de compartir se pueden encontrar en el encabezado de la página del lanzamiento.",
        "mockup": "track-tab-portal"
      },
      {
        "heading": "Notas",
        "body": "La pestaña Notas es un espacio de propósito general para notas de revisión y discusión que no está atado a un código de tiempo específico. En la parte superior hay un área de texto con marcador de posición \"Agregar una nota...\" y un botón \"Publicar\". Las notas aparecen debajo en orden cronológico inverso. Cada nota muestra el nombre del autor, una fecha o tiempo relativo y el mensaje. Las notas del cliente se distinguen visualmente con un distintivo verde \"Cliente\" para que puedas distinguir la retroalimentación interna de la externa de un vistazo. Usa esta pestaña para direcciones generales de revisión, elementos pendientes y discusión que no necesita referenciar un momento específico en el audio. Para retroalimentación específica por tiempo, usa los comentarios de forma de onda de la pestaña Audio en su lugar.",
        "mockup": "track-tab-notes"
      }
    ]
  },
  {
    "id": "client-portal",
    "title": "Portal del Cliente y Aprobaciones",
    "category": "releases",
    "summary": "Comparte tu lanzamiento con clientes vía un enlace único, controla qué ven y rastrea aprobaciones por pista.",
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
        "body": "En la página de detalle del lanzamiento, busca la alternancia del Portal en el área del encabezado (arriba a la derecha). Haz clic en la alternancia para activarla (se vuelve verde cuando está activa). Una vez activa, haz clic en el ícono de enlace junto a la alternancia para copiar la URL única de compartir. Envía este enlace a tu cliente para acceso de revisión sin requerir una cuenta de Mix Architect. El portal muestra el resumen del lanzamiento, lista de pistas, reproductores de audio y un sistema de comentarios. Usa la configuración del portal para controlar qué secciones a nivel de lanzamiento son visibles para los clientes: dirección de mezcla, especificaciones, referencias, estado de pago, metadatos de distribución y letras.",
        "mockup": "portal-settings"
      },
      {
        "heading": "Visibilidad por Pista",
        "body": "Para cada pista, ve a la pestaña Portal para controlar qué puede ver tu cliente. La sección Visibilidad del Portal de Pista tiene interruptores de alternancia para: \"Visible en portal\" (mostrar u ocultar toda la pista), \"Habilitar descarga\" (permitir o bloquear descargas de audio) y alternadores de versión individuales (Versión 1, Versión 2, Versión 3, etc.) para controlar a qué revisiones de audio puede acceder el cliente. Esto te da control detallado para que puedas ocultar trabajos en progreso y solo compartir mezclas terminadas. Todos los alternadores son independientes, por lo que puedes hacer una pista visible pero deshabilitar descargas, o mostrar solo la última versión.",
        "mockup": "portal-track-visibility"
      },
      {
        "heading": "Aprobaciones de Pista",
        "body": "Los clientes pueden aprobar o solicitar cambios en pistas individuales a través del portal. El estado de aprobación se rastrea en la sección Aprobación del Cliente de la pestaña Portal de cada pista. El estado muestra un distintivo coloreado (ej. \"Aprobado\" en verde) con un historial completo con marca de tiempo de cada evento de aprobación: cuándo el cliente aprobó, cuándo solicitó cambios (incluyendo su nota, como \"Vocales muy bajos\"), cuándo la pista fue reabierta para revisión y cuándo fue re-aprobada. Esto te da un rastro de auditoría claro de todas las decisiones del cliente. Los distintivos de aprobación también aparecen en la lista de pistas en la página de detalle del lanzamiento, para que puedas ver de un vistazo qué pistas están aprobadas.",
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
        "body": "Una plantilla captura un conjunto comprehensivo de valores predeterminados de lanzamiento a través de seis secciones plegables. Básicos: nombre de plantilla, descripción, una casilla \"Establecer como plantilla predeterminada\" (autoseleccionada para nuevos lanzamientos) y nombre y correo electrónico del artista/cliente. Configuración de Lanzamiento: tipo de lanzamiento (Sencillo, EP o Álbum), formato (Estéreo, Dolby Atmos o Estéreo + Atmos) y etiquetas de género. Especificaciones Técnicas: frecuencia de muestreo, profundidad de bits, selecciones de formato de entrega (WAV, AIFF, FLAC, MP3, AAC, OGG, DDP, ADM BWF/Atmos, MQA, ALAC) y requisitos especiales. Valores Predeterminados de Intención: etiquetas de cualidad emocional preseleccionadas para nuevas pistas. Metadatos de Distribución: distribuidor, sello discográfico, titular de derechos de autor, idioma, género principal y contactos de derechos y publicación. Valores Predeterminados de Pago: estado de pago, moneda y notas de pago. Cuando creas un lanzamiento desde una plantilla, todos estos valores predeterminados se aplican automáticamente.",
        "mockup": "template-contents"
      },
      {
        "heading": "Crear y Gestionar Plantillas",
        "body": "Hay dos maneras de crear una plantilla. Desde cualquier página de detalle de lanzamiento, haz clic en el botón \"Guardar como Plantilla\" en el encabezado (junto al engranaje de configuración) para capturar la configuración actual de ese lanzamiento. O ve a la página de [Plantillas](/app/templates) y haz clic en \"+ Nueva Plantilla\" para construir una desde cero usando el formulario completo de plantilla. Cada tarjeta de plantilla en la página de [Plantillas](/app/templates) muestra su nombre, descripción y una línea de resumen como \"Sencillo, Estéreo + Atmos, 96 kHz / 24-bit, 4 formatos de entrega\". Usa el menú de tres puntos en cualquier tarjeta de plantilla para opciones como editar o eliminar. Dale nombres descriptivos a las plantillas como \"Master Estéreo\" o \"EP Atmos\" para mantenerlas organizadas.",
        "mockup": "template-create"
      },
      {
        "heading": "Crear un Lanzamiento desde una Plantilla",
        "body": "Cuando creas un nuevo lanzamiento desde el [Tablero](/app), si tienes plantillas guardadas, se muestra un selector \"Empezar desde una plantilla\" como primer paso. Lee \"Pre-llena la configuración de tu lanzamiento, o empieza desde cero.\" Selecciona una tarjeta de plantilla y haz clic en \"Usar Plantilla\" para pre-llenar el formulario de nuevo lanzamiento con esas configuraciones, o haz clic en \"Empezar desde cero\" para omitir. El formulario de crear lanzamiento también tiene un enlace \"Cambiar plantilla\" en la parte inferior si quieres cambiar. Cualquier configuración de plantilla puede personalizarse después de que se cree el lanzamiento.",
        "tip": "Marca tu plantilla más usada como la predeterminada (casilla \"Establecer como plantilla predeterminada\") para que sea autoseleccionada cada vez que crees un nuevo lanzamiento.",
        "mockup": "template-use"
      }
    ]
  },
  {
    "id": "payment-tracking",
    "title": "Seguimiento de Pagos",
    "category": "releases",
    "summary": "Rastrea tarifas, pagos y saldos pendientes a través de tus lanzamientos.",
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
        "body": "Ve a [Configuración](/app/settings) y encuentra la sección Seguimiento de Pagos. La sección dice: \"Rastrea tarifas y estado de pago en lanzamientos y pistas. Desactiva esto si estás mezclando tus propios proyectos.\" Activa \"Habilitar seguimiento de pagos\". Una vez habilitado, las funciones relacionadas con pagos aparecen en toda la app: estadísticas de tarifas en el [Tablero](/app) (Pendientes, Ganados, Tarifas Totales), una sección Pago en la barra lateral del inspector en cada lanzamiento, y la página [Pagos](/app/payments) en la navegación de la barra lateral.",
        "mockup": "payment-dashboard"
      },
      {
        "heading": "Establecer Tarifas de Lanzamiento",
        "body": "Abre Configuración del Lanzamiento (haz clic en el ícono de engranaje en cualquier lanzamiento). Desplázate hacia abajo a la sección Pago. Establece el Estado de Pago: Sin Tarifa, No Pagado, Parcial o Pagado. Usa el área de texto Notas de Pago para registrar términos, información de depósito o fechas de vencimiento. La cantidad de tarifa e información de pago también es visible en la barra lateral del inspector en la página de detalle del lanzamiento bajo el encabezado Pago, donde puedes hacer clic en el estado para cambiarlo rápidamente.",
        "mockup": "payment-release-fees"
      },
      {
        "heading": "Tablero de Pagos",
        "body": "Accede a la página [Pagos](/app/payments) desde la barra lateral. En la parte superior, tres tarjetas de resumen muestran Pendiente (total no pagado), Ganado (total pagado) y Tarifas Totales a través de todos los lanzamientos, cada una con un conteo de lanzamientos. Debajo, una tabla lista cada lanzamiento con datos de pago: Nombre del lanzamiento, Fecha, Artista, Tarifa, Pagado, Saldo y Estado (con distintivos coloreados como \"Parcial\" en naranja). Una fila Total en la parte inferior suma todas las tarifas. Usa el botón \"Exportar CSV\" para descargar datos de pago como una hoja de cálculo, o \"Descargar PDF\" para generar un resumen de pago listo para imprimir.",
        "tip": "Haz clic en las tarjetas de estadísticas Pendiente o Ganado en el [Tablero](/app) para filtrar rápidamente a lanzamientos que coincidan con ese estado de pago.",
        "mockup": "payment-track-fees"
      }
    ]
  },
  {
    "id": "distribution-tracker",
    "title": "Rastreador de Distribución",
    "category": "releases",
    "summary": "Rastrea dónde se ha enviado tu lanzamiento, monitorea el estado en todas las plataformas y recibe notificaciones cuando esté disponible en Spotify.",
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
        "heading": "Agregar Plataformas a un Lanzamiento",
        "body": "Abre cualquier lanzamiento y desplázate hacia abajo hasta el panel Rastreador de Distribución debajo de la lista de pistas. Haz clic en \"+ Agregar Plataforma\" para añadir una plataforma de streaming. Elige entre Spotify, Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud o Bandcamp. Cada plataforma aparece como una fila con su logotipo oficial, un indicador de estado y una etiqueta de distribuidor. También puedes usar \"Marcar como Enviado\" para agregar múltiples plataformas a la vez: selecciona un distribuidor (DistroKid, TuneCore, CD Baby, LANDR, Ditto, AWAL, UnitedMasters, Amuse, RouteNote o Auto-lanzamiento), marca las plataformas a las que enviaste y haz clic en Enviar.",
        "mockup": "distribution-add-platform"
      },
      {
        "heading": "Estados de Estado",
        "body": "Cada entrada de plataforma tiene un estado que rastrea en qué punto del proceso de lanzamiento se encuentra. Los seis estados son: No Enviado (gris, predeterminado para plataformas recién agregadas), Enviado (azul, has enviado el lanzamiento a tu distribuidor), Procesando (naranja, el distribuidor está revisando o procesando), En Vivo (verde, el lanzamiento está disponible en la plataforma), Rechazado (rojo, la plataforma o el distribuidor rechazó el lanzamiento) y Retirado (rojo, el lanzamiento estuvo disponible previamente pero fue eliminado). Haz clic en el indicador de estado en cualquier fila de plataforma para cambiarlo. Los cambios de estado se registran en el historial de la plataforma para que puedas ver cuándo ocurrió cada transición.",
        "mockup": "distribution-status"
      },
      {
        "heading": "Detección Automática de Spotify",
        "body": "Spotify aparece en la parte superior del Rastreador de Distribución con una etiqueta \"Se actualiza automáticamente\". Una vez que marques Spotify como Enviado, Mix Architect verifica periódicamente el catálogo de Spotify buscando tu lanzamiento usando el código ISRC (de la pestaña Distribución de la pista) o el título del lanzamiento y nombre del artista. Cuando tu lanzamiento se encuentra en Spotify, el estado cambia automáticamente a En Vivo, la URL de Spotify se guarda y recibes una notificación. También puedes hacer clic en \"Verificar Ahora\" para activar una verificación inmediata. La detección automática se ejecuta diariamente para todas las entradas de Spotify enviadas.",
        "tip": "Completa el código ISRC en la pestaña Distribución de tu pista antes de enviar. La detección basada en ISRC es más confiable que la coincidencia por título/artista, especialmente para nombres comunes.",
        "mockup": "distribution-spotify"
      },
      {
        "heading": "Actualizar Estado y Agregar Enlaces",
        "body": "Para cambiar el estado de una plataforma, haz clic en el indicador de estado en la fila de la plataforma. Aparece una fila de píldoras de estado donde puedes seleccionar el nuevo estado. Para agregar un enlace al lanzamiento en esa plataforma, haz clic en \"Agregar enlace\" junto al nombre de la plataforma. Ingresa la URL (por ejemplo, el enlace del álbum en Spotify o la página de Apple Music) y haz clic en Guardar. El ícono de enlace se convierte en un enlace externo clicable que abre la página del lanzamiento en esa plataforma. Usa el menú de tres puntos en cualquier fila de plataforma para opciones adicionales: editar detalles, eliminar la plataforma o ver el historial de cambios de estado.",
        "mockup": "distribution-edit"
      },
      {
        "heading": "Envío Masivo y Actualización",
        "body": "\"Marcar como Enviado\" te permite registrar un envío por lotes a tu distribuidor. Selecciona el distribuidor del menú desplegable, marca las plataformas a las que enviaste y haz clic en Enviar. Todas las plataformas seleccionadas se agregan con estado Enviado y la etiqueta del distribuidor. \"Verificar Ahora\" aparece en las entradas de Spotify que han sido enviadas. Al hacer clic se activa una búsqueda inmediata en el catálogo de Spotify. Si se encuentra, el estado se actualiza a En Vivo y la URL se guarda automáticamente. Para todas las demás plataformas (Apple Music, Tidal, Amazon Music, YouTube Music, Deezer, SoundCloud, Bandcamp), actualiza el estado manualmente cuando confirmes que el lanzamiento está disponible.",
        "mockup": "distribution-bulk"
      },
      {
        "heading": "Etiquetas de Distribuidor",
        "body": "Cada entrada de plataforma puede tener una etiqueta de distribuidor que muestra qué servicio usaste para enviar (DistroKid, TuneCore, CD Baby, etc.). Esto aparece como una pequeña píldora junto al indicador de estado. Las etiquetas de distribuidor se establecen automáticamente cuando usas \"Marcar como Enviado\", o puedes establecerlas individualmente al editar una entrada de plataforma. Esto te ayuda a rastrear qué distribuidor manejó cada plataforma, especialmente si usas diferentes distribuidores para diferentes territorios o plataformas.",
        "warning": "Los análisis solo reflejan los datos que has rastreado en Mix Architect. Si envías a través del panel de tu distribuidor, recuerda actualizar el estado aquí para que tu rastreador se mantenga preciso.",
        "mockup": "distribution-distributor"
      }
    ]
  },
  {
    "id": "user-analytics",
    "title": "Análisis de Usuario",
    "category": "releases",
    "summary": "Consulta tus lanzamientos completados, tiempo promedio de entrega, ingresos totales y desglose por cliente en el tablero de Análisis.",
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
        "heading": "Qué Muestra la Página de Análisis",
        "body": "Accede a la página de [Análisis](/app/analytics) desde la barra lateral. El tablero muestra cuatro tarjetas de resumen en la parte superior: Lanzamientos Completados (total de proyectos terminados con promedio mensual), Tiempo Promedio de Entrega (días desde la creación hasta la finalización, con desglose del más rápido y más lento), Ingresos Totales (suma de todas las tarifas rastreadas con saldo pendiente) y Clientes (conteo de clientes únicos con total de lanzamientos). Debajo de las tarjetas de resumen, tres gráficas visualizan tus datos a lo largo del tiempo, y una tabla de desglose por cliente muestra estadísticas por cada cliente.",
        "mockup": "analytics-overview"
      },
      {
        "heading": "Velocidad de Lanzamiento y Tiempo de Entrega",
        "body": "La gráfica de Velocidad de Lanzamiento es una gráfica de barras que muestra cuántos lanzamientos completaste cada mes dentro del rango de fechas seleccionado. Barras más altas significan meses más productivos. Usa esto para detectar tendencias en tu producción e identificar períodos ocupados o lentos. La gráfica de Tiempo de Entrega muestra el promedio de días desde la creación del lanzamiento hasta su finalización por mes. Barras más bajas significan entregas más rápidas. Juntas, estas gráficas te ayudan a entender tu capacidad y si tu flujo de trabajo se está volviendo más rápido o más lento con el tiempo.",
        "mockup": "analytics-velocity"
      },
      {
        "heading": "Gráfica de Ingresos",
        "body": "La gráfica de Ingresos es una gráfica de área que muestra las tarifas totales ganadas por mes. Rastrea los montos de pago registrados en tus lanzamientos, así que refleja lo que los clientes realmente han pagado. Usa esto para ver tendencias de ingresos, identificar tus meses de mayores ganancias y planificar para períodos más tranquilos. Los datos de ingresos provienen de la función de seguimiento de pagos en cada lanzamiento, así que asegúrate de que las tarifas y los estados de pago estén actualizados para obtener reportes precisos.",
        "mockup": "analytics-revenue"
      },
      {
        "heading": "Desglose por Cliente",
        "body": "La tabla de Desglose por Cliente en la parte inferior de la página de Análisis lista a cada cliente con sus métricas clave: número de lanzamientos, ingresos totales, monto pagado y tiempo promedio de entrega. Esto te ayuda a identificar qué clientes generan más trabajo e ingresos, quién paga a tiempo y dónde se invierte tu tiempo. Haz clic en cualquier fila de cliente para ver sus lanzamientos. La tabla se ordena por ingresos de forma predeterminada.",
        "mockup": "analytics-clients"
      },
      {
        "heading": "Selector de Rango de Fechas",
        "body": "Usa el selector de rango de fechas en la esquina superior derecha para controlar qué período cubren los análisis. Los rangos predefinidos incluyen Últimos 7 Días, Últimos 30 Días, Últimos 90 Días y Últimos 365 Días. También puedes establecer un rango de fechas personalizado seleccionando fechas de inicio y fin específicas. Las cuatro tarjetas de resumen y las tres gráficas se actualizan para reflejar el período seleccionado. El selector de rango de fechas funciona de la misma manera en todo el tablero de análisis.",
        "tip": "Usa el rango de 365 días para revisiones anuales y preparación de impuestos. El rango de 30 días es útil para revisiones mensuales de la salud de tu negocio.",
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
        "body": "Cada vez que subes un nuevo archivo a la misma pista, se convierte en la siguiente versión. El selector de versión arriba de la forma de onda muestra botones numerados (v1, v2, v3, etc.) más un botón + para subir otra versión. Haz clic en cualquier versión para cambiar a ella. Cada versión muestra su número de versión, fecha de subida, conteo de comentarios y un ícono de descarga para descargar el archivo original. Las versiones anteriores se preservan completamente con sus propios comentarios y forma de onda.",
        "tip": "Sube mezclas revisadas a la misma pista en lugar de crear una nueva pista. Esto mantiene tu historial de versiones limpio, preserva comentarios en versiones anteriores y te permite comparar mezclas a lo largo del tiempo.",
        "mockup": "track-versions"
      },
      {
        "heading": "Reproductor de Forma de Onda",
        "body": "Cada versión subida muestra una forma de onda interactiva. Haz clic en cualquier lugar de la forma de onda para buscar en esa posición. Los controles de transporte debajo de la forma de onda incluyen: tiempo actual, alternancia de bucle, retroceder, reproducir/pausar, avanzar, alternancia de repetir y duración total. El reproductor también muestra una medición de sonoridad LUFS integrada (ej. \"-14.8 LUFS\") junto a los metadatos del archivo, codificado por colores contra objetivos de sonoridad para que puedas evaluar niveles de un vistazo. Si hay comentarios con marca de tiempo en la versión actual, pequeños íconos marcadores aparecen en la forma de onda en sus posiciones.",
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
        "body": "Abre cualquier pista y ve a la pestaña Especificaciones. Desplázate a la sección Entrega. Aquí seleccionas qué formatos de salida necesita tu proyecto haciendo clic en los chips de formato. Formatos convertibles disponibles: WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos seleccionados aparecen resaltados en verde con un ícono de marca de verificación. Formatos no convertibles adicionales (DDP, ADM BWF/Atmos, MQA) pueden activarse para referencia, muestran un tooltip informativo explicando que la conversión automática no está disponible. También puedes escribir un nombre de formato personalizado en el campo de entrada \"Formato personalizado...\" y hacer clic en \"+ Agregar\" para cualquier formato no listado. Usa el menú desplegable \"Exportar desde\" para elegir de qué versión de audio convertir, como \"v3 - filename.wav (último)\".",
        "mockup": "format-convert"
      },
      {
        "heading": "Convertir y Descargar",
        "body": "Selecciona qué formatos deberían estar disponibles haciendo clic en los chips de formato en la sección Entrega: los formatos convertibles incluyen WAV, AIFF, FLAC, MP3, AAC, OGG y ALAC. Los formatos seleccionados aparecen resaltados en verde con una marca de verificación. Haz clic en el ícono de flecha de descarga junto a cualquier formato convertible seleccionado para iniciar una conversión. El ícono muestra un spinner mientras la conversión se procesa en segundo plano. Cuando la conversión se completa, el archivo se descarga automáticamente a tu navegador. Cada conversión usa la versión de audio que seleccionaste en el menú desplegable \"Exportar desde\", convirtiendo del archivo original subido para preservar la máxima calidad de audio. Los formatos sin pérdida (WAV, AIFF, FLAC, ALAC) preservan la frecuencia de muestreo y profundidad de bits del archivo fuente. Los formatos con pérdida usan presets optimizados: MP3 exporta a 44.1 kHz / 320 kbps, AAC a 44.1 kHz / 256 kbps y OGG a 44.1 kHz / Calidad 8.",
        "mockup": "track-tab-specs"
      },
      {
        "heading": "Incrustación Automática de Metadatos",
        "body": "Cuando conviertes a MP3, FLAC, AAC, OGG o ALAC, Mix Architect escribe automáticamente etiquetas de metadatos estándar de la industria en el archivo de salida. Esto incluye: artista, título, álbum, número de pista, género, año de lanzamiento, copyright, ISRC, UPC/código de barras, letras, portada y ReplayGain. ReplayGain es una etiqueta de sonoridad que dice a reproductores compatibles cuánto ajustar el volumen para que las pistas se reproduzcan a un nivel consistente sin distorsión. Mix Architect la calcula desde el LUFS medido de tu audio usando el estándar ReplayGain 2.0 (nivel de referencia de -18 LUFS). Los archivos MP3 obtienen etiquetas ID3v2, FLAC y OGG usan comentarios Vorbis, y AAC/ALAC usan átomos MP4 estilo iTunes. Todos los metadatos se extraen de los detalles de tu lanzamiento y pista (incluyendo la pestaña Distribución para ISRC y letras, y la portada del lanzamiento). Las exportaciones WAV y AIFF no incluyen etiquetas de metadatos. Después de que una conversión se completa, pasa el cursor sobre el ícono de etiqueta junto al chip de formato para ver exactamente qué etiquetas se incrustaron.",
        "tip": "Llena tu pestaña Distribución (ISRC, letras) y sube portada antes de exportar. Mientras más metadatos proporciones, más completos estarán tus archivos exportados para distribución."
      },
      {
        "heading": "Referencia de Formatos Soportados",
        "body": "Los formatos sin pérdida preservan la calidad fuente: WAV (PCM, tasa/profundidad fuente), AIFF (PCM, tasa/profundidad fuente), FLAC (tasa fuente), ALAC (tasa fuente). Los formatos con pérdida usan presets fijos optimizados para distribución: MP3 (44.1 kHz, 320 kbps, estéreo), AAC (44.1 kHz, 256 kbps, estéreo), OGG Vorbis (44.1 kHz, calidad 8, estéreo). Formatos no convertibles (solo etiqueta, sin auto-conversión): DDP, ADM BWF (Atmos), MQA. La Configuración Técnica (frecuencia de muestreo y profundidad de bits) en la parte superior de la pestaña Especificaciones son metadatos de referencia que describen el audio fuente, no controlan la salida de conversión. El área de texto Requisitos Especiales debajo de los formatos de entrega te permite agregar notas sobre instrucciones de entrega.",
        "warning": "Convertir de un formato con pérdida (MP3, AAC, OGG) a un formato sin pérdida (WAV, FLAC) no mejora la calidad de audio. Los artefactos de compresión originales permanecen. Siempre sube tu archivo fuente de más alta calidad.",
        "mockup": "supported-formats"
      }
    ]
  },
  {
    "id": "audio-review-comments",
    "title": "Dejar Comentarios con Marca de Tiempo",
    "category": "audio",
    "summary": "Agrega retroalimentación codificada por tiempo directamente en la forma de onda para que los colaboradores sepan exactamente dónde escuchar.",
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
        "heading": "Agregar un Comentario",
        "body": "Abre una pista y ve a la pestaña Audio. Haz doble clic en la forma de onda en el punto exacto que quieres referenciar. Aparece una entrada de texto en la sección Retroalimentación debajo de la forma de onda donde puedes escribir tu comentario. El comentario se ancla a ese código de tiempo y versión. En la sección Retroalimentación, cada comentario muestra el nombre del autor, un distintivo de marca de tiempo coloreado (ej. \"0:07\" o \"1:22\"), la fecha relativa y el texto del mensaje. Los marcadores de comentarios también aparecen como pequeños íconos directamente en la forma de onda en sus posiciones. Haz clic en cualquier marca de tiempo para saltar la cabeza de reproducción a ese momento.",
        "mockup": "track-tab-audio"
      },
      {
        "heading": "Comentarios del Portal",
        "body": "Los clientes revisando a través del portal también pueden dejar comentarios con marca de tiempo en la forma de onda. Sus comentarios aparecen en la misma sección Retroalimentación junto a los comentarios del equipo pero se distinguen visualmente con un distintivo \"Cliente\" para que puedas identificar rápidamente la retroalimentación externa. Esto mantiene toda la retroalimentación, interna y externa, organizada en un lugar bajo la versión relevante de audio.",
        "mockup": "portal-comments"
      },
      {
        "heading": "Notas vs Comentarios de Audio",
        "body": "La pestaña Audio es para retroalimentación con marca de tiempo atada a momentos específicos en la forma de onda: \"subir las vocales en 1:22\" o \"la caja está muy fuerte aquí\". La pestaña Notas es para discusión general y notas de revisión que no están atadas a un código de tiempo: \"en general la mezcla necesita más graves\" o \"el cliente quiere un enfoque más agresivo\". Los comentarios de Audio son específicos de versión (atados a v1, v2, etc.), mientras que las Notas aplican a la pista como un todo. Usa la pestaña Intención para documentar la visión creativa general, etiquetas emocionales y pistas de referencia.",
        "tip": "Para una imagen completa de la retroalimentación en una pista, revisa tanto la sección Retroalimentación de la pestaña Audio (para notas específicas por tiempo) como la pestaña Notas (para discusión general). La retroalimentación del cliente puede aparecer en cualquier lugar.",
        "mockup": "resolve-feedback"
      }
    ]
  },
  {
    "id": "timeline-overview",
    "title": "Usar la Vista de Cronograma",
    "category": "timeline",
    "summary": "Cambia a vista de cronograma en tu tablero para visualizar horarios de lanzamientos y cuenta regresiva a fechas de lanzamiento.",
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
        "heading": "Cambiar a Vista de Cronograma",
        "body": "En el [Tablero](/app), busca los dos botones de alternancia de vista en el área del encabezado (debajo de las estadísticas de pago). Haz clic en el ícono de cronograma (el segundo botón) para cambiar de vista de cuadrícula a vista de cronograma. El cronograma muestra tus lanzamientos cronológicamente basándose en sus fechas objetivo de lanzamiento. Los lanzamientos sin fecha objetivo aparecen en una sección separada \"No Programados\" en la parte inferior. Tu preferencia de vista se guarda automáticamente, así que el tablero recordará tu elección la próxima vez que visites.",
        "mockup": "timeline-full"
      },
      {
        "heading": "Leer el Cronograma",
        "body": "Cada lanzamiento aparece como una tarjeta posicionada por su fecha objetivo de lanzamiento. El cronograma muestra una cuenta regresiva: \"X días hasta el lanzamiento\" para fechas próximas o \"Lanzado hace X días\" para fechas pasadas. Las tarjetas de lanzamiento muestran la misma información que la vista de cuadrícula (título, artista, estado, formato, conteo de pistas) más el contexto de programación. Los puntos de estado están codificados por colores: naranja para Borrador, azul para En Progreso y verde para Listo. Los lanzamientos anclados aparecen en la parte superior del cronograma.",
        "mockup": "timeline-navigate"
      },
      {
        "heading": "Establecer Fechas Objetivo",
        "body": "Para agregar un lanzamiento al cronograma, establece una fecha objetivo de lanzamiento ya sea al crear el lanzamiento o en Configuración del Lanzamiento (ícono de engranaje en la página del lanzamiento). El campo Fecha Objetivo de Lanzamiento usa un selector de fecha. El cronograma se actualiza automáticamente mientras ajustas fechas. Esto te ayuda a visualizar tu horario y evitar ventanas de lanzamiento superpuestas a través de múltiples proyectos.",
        "tip": "Usa la vista de cronograma durante la planificación para espaciar tus lanzamientos. Tener visibilidad clara de fechas límite próximas ayuda a prevenir cuellos de botella en tu flujo de trabajo de mezcla, masterización o distribución.",
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
        "body": "La exportación de datos es un archivo ZIP que contiene todos los metadatos de tus lanzamientos, detalles de pistas, archivos de audio (todas las versiones) y registros de pago. Antes de descargar, la app muestra una estimación del tamaño de la exportación junto con conteos: número de lanzamientos, pistas y archivos de audio incluidos. Esto te da una copia de seguridad completa de todo en tu cuenta.",
        "mockup": "export-contents"
      },
      {
        "heading": "Iniciar una Exportación",
        "body": "Ve a [Configuración](/app/settings) y desplázate a la sección \"Tus Datos\". Haz clic en \"Exportar Mis Datos\" para comenzar. La app primero calcula una estimación mostrando el tamaño aproximado del archivo y conteos (ej. \"3 lanzamientos, 12 pistas, 8 archivos de audio\"). Revisa la estimación, luego haz clic en \"Descargar\" para iniciar la exportación. Una barra de progreso muestra el estado de descarga. Para cuentas grandes con muchos archivos de audio, la exportación puede tomar tiempo. El archivo ZIP se descarga automáticamente a tu navegador cuando se completa. Puedes hacer clic en \"Cancelar\" para regresar sin descargar.",
        "mockup": "export-progress"
      },
      {
        "heading": "Privacidad de Datos",
        "body": "Tu exportación contiene solo datos que posees o has creado. Las contribuciones de colaboradores (como comentarios en tus lanzamientos) se incluyen, pero los datos privados de otros usuarios no. La exportación se genera a demanda y no se almacena en nuestros servidores después de la descarga.",
        "tip": "Ejecuta una exportación de datos periódicamente como respaldo de tus proyectos y archivos de audio. Esto es especialmente útil antes de hacer cambios importantes a tu cuenta.",
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
        "body": "Ve a [Configuración](/app/settings) y desplázate a la sección Suscripción en la parte inferior. La sección dice \"Gestiona tu plan de Mix Architect\". Verás tu plan actual: las cuentas Pro muestran \"$14/mes, Lanzamientos ilimitados\" con un distintivo verde \"PRO\" y un botón \"Gestionar Facturación\". Las cuentas gratuitas muestran un botón \"Actualizar a Pro\" en su lugar.",
        "mockup": "plan-current"
      },
      {
        "heading": "Actualizar a Pro",
        "body": "Desde la página de [Configuración](/app/settings), haz clic en \"Actualizar a Pro\" en la sección Suscripción. Serás llevado a una página segura de checkout de Stripe. Una vez que se confirma el pago, tu cuenta se actualiza inmediatamente y obtienes acceso a todas las funciones Pro, incluyendo lanzamientos ilimitados y conversión de audio. El distintivo Pro aparece junto a la información de tu plan.",
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
    "title": "Cancelar y Resuscribirse",
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
        "body": "Todos tus lanzamientos, pistas, archivos de audio, comentarios y registros de pago se preservan completamente. No pierdes nada al degradar. Sin embargo, las funciones Pro (como lanzamientos ilimitados y conversión de audio) se volverán no disponibles hasta que te resuscribas. Tus lanzamientos existentes permanecen accesibles.",
        "warning": "Las cuentas gratuitas están limitadas a un lanzamiento activo. Si tienes más de un lanzamiento cuando tu plan Pro expira, tus lanzamientos existentes se preservan pero no podrás crear nuevos lanzamientos hasta que te resuscribas o reduzcas a un lanzamiento.",
        "mockup": "data-after-cancel"
      },
      {
        "heading": "Resuscribirse",
        "body": "Para reactivar Pro, ve a la sección Suscripción en [Configuración](/app/settings) y haz clic en \"Actualizar a Pro\" nuevamente, o usa \"Gestionar Facturación\" para resuscribirte a través del portal de Stripe. Tus datos anteriores, configuración, plantillas y configuraciones de equipo están todos intactos e inmediatamente disponibles.",
        "mockup": "resubscribe"
      }
    ]
  }
];
