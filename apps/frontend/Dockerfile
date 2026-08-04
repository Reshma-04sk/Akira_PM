# --- Development Stage ---
FROM node:20-alpine AS development

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@9.12.3

# Copy package configuration
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy application files
COPY . .

EXPOSE 5173

CMD ["pnpm", "dev", "--host"]

# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm@9.12.3

# Copy package configurations
COPY package.json ./

# Install dependencies
RUN pnpm install

# Copy application source
COPY . .

# Set API URL environment variable at build-time
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

# Build application
RUN pnpm build

# --- Runner Stage (Nginx) ---
FROM nginx:alpine AS runner

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
