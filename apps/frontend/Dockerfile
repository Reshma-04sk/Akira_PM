FROM node:20-alpine AS development

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@9.12.3

# Copy workspace dependency configuration
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy application files
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]
