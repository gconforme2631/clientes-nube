# Imagen de la API: Node.js LTS sobre Alpine Linux (liviana).
FROM node:24-alpine
WORKDIR /app

# 1. Dependencias de producción (se aprovecha la caché si package*.json no cambia).
COPY package*.json ./
RUN npm ci --omit=dev

# 2. Código fuente.
COPY src ./src

# 3. Carpeta para SQLite cuando no hay DATABASE_URL (solo pruebas locales).
RUN mkdir -p /app/datos && chown node:node /app/datos
ENV NODE_ENV=production DB_ARCHIVO=/app/datos/clientes.db

EXPOSE 3000
USER node
CMD ["node", "src/server.js"]