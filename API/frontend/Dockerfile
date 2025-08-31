# Use Node.js 18 Alpine image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./


# Install dependencies
RUN npm install
RUN npm install @mui/material @mui/icons-material @emotion/react @emotion/styled
# Copy source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Start development server
CMD ["npm", "start"]
