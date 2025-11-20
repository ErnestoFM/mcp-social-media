# ======================================================================
# ETAPA 1: "EL CONSTRUCTOR" (Builder)
# Esta etapa instala TODO, incluyendo TypeScript, y compila el código.
# ======================================================================
FROM node:20-alpine AS builder
# Usamos 'alpine' porque es una versión de Linux muy ligera

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar los archivos de manifiesto del proyecto
COPY package.json package-lock.json ./
RUN mkdir -p /app/sandbox
# Instalar TODAS las dependencias (incluyendo devDependencies como 'typescript')
RUN npm install

# Copiar todo el código fuente del proyecto
COPY . .

# Compilar el TypeScript a JavaScript (creará la carpeta /build)
RUN npm run build

# ======================================================================
# ETAPA 2: "EL FINAL" (Producción)
# Esta etapa construye la imagen final y ligera que se usará.
# ======================================================================
FROM node:20-alpine
RUN apk update && apk upgrade

WORKDIR /app

# --- ¡EL PASO MÁS IMPORTANTE PARA TI! ---
# 'fluent-ffmpeg' necesita el binario 'ffmpeg' real.
# Lo instalamos en el sistema operativo del contenedor.
RUN apk update && apk add ffmpeg

# Copiar solo lo que necesitamos de la etapa "builder"
# No copiamos el código fuente (src), solo el compilado (build).
COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# (OPCIONAL) Si tuvieras una 'oci_wallet', la copiarías aquí:
# COPY --from=builder /app/oci_wallet ./oci_wallet

# Comando que se ejecutará cuando el contenedor inicie
# (Asume que tu package.json tiene un script "start": "node build/index.js")
CMD ["npm", "start"]