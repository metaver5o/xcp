FROM node:18-alpine

WORKDIR /app

# Instalar dependências
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++

# Copiar package.json
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código
COPY . .

# Expor portas
EXPOSE 4000 18332 18443

# Comando de inicialização
CMD ["npm", "start"]