# 🤖 mcp-social-media (Servidor MCP de Redes Sociales)

Servidor MCP (Model Context Protocol) en Node.js/TypeScript para gestionar Instagram, Facebook y Threads, con análisis en DynamoDB y sistema de archivos seguro.

Este proyecto actúa como un "agente" de backend que permite a un asistente de IA (como Claude) interactuar de forma segura con APIs de redes sociales y un sistema de archivos local.

## ✨ Características Principales

Arquitectura Modular: El código está organizado por plataformas (instagram, facebook, threads) y utilidades (s3, database), todas controladas por un enrutador central en index.ts.

Gestión Multiplataforma:

Instagram: Publica fotos, carruseles, Reels. Lee perfil, posts y comentarios.

Facebook: Publica fotos, videos, texto y enlaces. Lee detalles de la página, posts y comentarios.

Threads: (Desactivado por permisos) Lógica implementada para publicar hilos de texto e imágenes.

Análisis de Crecimiento: Se conecta a AWS DynamoDB para guardar "snapshots" diarios de seguidores y conteo de posts.

Sistema de Archivos Seguro: Proporciona herramientas (fs_read, fs_write) que están "enjauladas" (sandboxed) en una carpeta específica, previniendo el acceso no autorizado al resto del sistema.

Pipeline de Medios: Utiliza AWS S3 como almacenamiento intermedio para subir fotos y videos antes de pasarlos a las APIs de Meta, como lo requiere su flujo de trabajo.

Validación Avanzada: Usa fluent-ffmpeg y media.ts para validar archivos antes de la subida (tamaño, extensión, duración del video).

---

## 🛠️ Herramientas Expuestas (Tooling)

Este servidor expone un conjunto de herramientas para que la IA las utilice:

### Instagram (`instagram_...`)

- `upload_and_publish_photo`
- `upload_and_publish_carousel`
- `upload_and_publish_reel`
- `get_profile`
- `get_posts` / `get_reels` / `get_comments`
- `delete_post` / `reply_to_comment`

### Facebook (`facebook_...`)

- `facebook_publish_photo`
- `facebook_publish_video`
- `facebook_publish_text_post`
- `facebook_publish_link_post`
- `facebook_get_page_details`
- `facebook_get_posts` / `facebook_get_comments`
- `facebook_delete_post` / `facebook_reply_to_comment`

### Análisis (`multi_...`)

- `run_daily_snapshot`: Guarda las estadísticas del día en DynamoDB.
- `get_growth_report`: Analiza el crecimiento de seguidores/posts en un período.
- `get_full_comparison_report`: Compara el rendimiento entre plataformas.
- `suggest_platform`: Sugiere la mejor plataforma basado en una descripción.

### Sistema de Archivos (`fs_...`)

- `fs_list_directory`
- `fs_read_file`
- `fs_write_file`
- `fs_create_folder`
- `fs_move_file`

---

## 🚀 Cómo Empezar

Este proyecto está diseñado para funcionar como un servidor MCP local conectado a un asistente de IA (como Claude).

### 1. Prerrequisitos

- [Node.js](https://nodejs.org/) (v18+)
- Una cuenta de desarrollador de [Meta (Facebook)](https://developers.facebook.com/)
- Una cuenta de [AWS (Amazon Web Services)](https://aws.amazon.com/)
- Tener `ffmpeg` instalado localmente (para la validación de video)

### 2. Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/ErnestoFM/mcp-social-media.git
    cd mcp-social-media
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea tu "jaula" (sandbox) para el sistema de archivos:
    ```bash
    mkdir mcp-sandbox
    ```

### 3. Configuración

1.  **Crea el archivo `.env`:**
    Crea un archivo llamado `.env` en la raíz del proyecto (junto a `package.json`).

2.  **Rellena las variables de entorno:**
    Copia y pega esto en tu archivo `.env` y rellena tus claves:

    ```.env
    # --- API de Meta (Instagram, Facebook, Threads) ---
    INSTAGRAM_API_URL="https://graph.facebook.com/v18.0"
    INSTAGRAM_ACCESS_TOKEN="TU_TOKEN_DE_INSTAGRAM_Y_THREADS"
    INSTAGRAM_USER_ID="TU_ID_DE_USUARIO_DE_INSTAGRAM"
    FACEBOOK_PAGE_ID="TU_ID_DE_PAGINA_DE_FACEBOOK"
    FACEBOOK_PAGE_ACCESS_TOKEN="TU_TOKEN_DE_PAGINA_DE_FACEBOOK"

    # --- AWS (S3 y DynamoDB) ---
    AWS_REGION="ej_us-east-1"
    AWS_ACCESS_KEY_ID="TU_CLAVE_DE_ACCESO_AWS"
    AWS_SECRET_ACCESS_KEY="TU_CLAVE_SECRETA_AWS"
    AWS_S3_BUCKET="EL_NOMBRE_DE_TU_BUCKET_S3"
    DYNAMODB_TABLE_NAME="social_stats"

    # --- Servidor Local ---
    # ¡Importante! Usa doble barra \\ en Windows
    FILESYSTEM_SANDBOX="C:\\Users\\tu-usuario\\Documents\\mcp-sandbox"

    # --- (Opcional) Google Gemini ---
    # GEMINI_API_KEY="TU_CLAVE_DE_GEMINI_AI_STUDIO"
    ```

3.  **Crea la tabla DynamoDB:**
    - Ve a la consola de AWS ➔ DynamoDB ➔ "Crear tabla".
    - **Nombre de la tabla:** `social_stats` (o el que pusiste en tu `.env`)
    - **Clave de partición:** `platform` (Tipo: String)
    - **Clave de ordenación:** `stat_date` (Tipo: String)
    - Deja el resto en la configuración predeterminada y haz clic en "Crear tabla".

### 4. Ejecutar el Servidor

1.  **Compilar el TypeScript:**
    ```bash
    npm run build
    ```
2.  **Iniciar el servidor:**
    ```bash
    npm start
    ```
    (Asegúrate de que tu `package.json` tenga un script `start`: `"start": "node build/index.js"`)

### 5. Conectar a Claude

1.  Abre Claude (o tu cliente MCP).
2.  Ve a la configuración de "Tool Use" (Uso de herramientas).
3.  Crea un nuevo conector y apunta a la configuración local (`mcp-config.json`) que corresponda a este proyecto.
4.  ¡Empieza a darle instrucciones!
    > "Publica esta foto `C:\...\mi-foto.jpg` en Instagram con el texto '¡Hola Mundo!'"
    > "Lanza el snapshot diario de estadísticas"
    > "Dame el reporte de crecimiento de Facebook de los últimos 15 días"
