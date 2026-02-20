# ---- Stage 1: Build Environment ----
FROM node:20-alpine AS builder
WORKDIR /app
# Copy and install dependencies
COPY package*.json ./
RUN npm install
# Copy source and build
COPY . .
RUN --mount=type=secret,id=vite-secrets,dst=/app/.env npm run build


# ---- Stage 2: Nginx for Production ----
FROM nginx:1.27-alpine
WORKDIR /usr/share/nginx/html
# Remove default nginx static files
RUN rm -rf ./*
# Copy built frontend from builder
COPY --from=builder /app/dist ./
# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]