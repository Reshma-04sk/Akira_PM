# --- Development Stage ---
FROM node:22-alpine AS development

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
FROM node:22-alpine AS builder

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

# Configure non-root user for Nginx
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /etc/nginx/conf.d

USER nginx

# Copy built files from builder stage
COPY --from=builder --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
