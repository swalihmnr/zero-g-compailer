FROM node:20-bookworm-slim

# Install system compilers and runtime environments:
# - python3
# - gcc, g++ (C / C++)
# - default-jdk (Java javac / java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    gcc \
    g++ \
    default-jdk \
    sqlite3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for better Docker layer caching
COPY package*.json ./
RUN npm install

# Copy source and configuration files
COPY . .

# Build client React bundle & TypeScript server
RUN npm run build

# Default environment variables
ENV PORT=3001
ENV HOST=0.0.0.0
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "dist/server.js"]

