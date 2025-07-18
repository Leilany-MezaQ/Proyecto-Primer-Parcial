# Usar una imagen base de Node.js
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Compilar el código TypeScript
RUN npm run build

# Exponer el puerto en el que corre el servicio
EXPOSE 4000

# Comando para iniciar la aplicación compilada
CMD ["npx", "tsx", "dist/index.js"]