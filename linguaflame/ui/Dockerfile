# ── Build stage ──────────────────────────────────────────────
# Use Debian-based Node to avoid Alpine native-build toolchain issues
FROM node:22-bullseye-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --no-audit --no-fund --legacy-peer-deps

COPY . .
RUN npm run build

# ── Production stage ──────────────────────────────────────────
FROM nginx:1.27-alpine AS production

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Non-root user for security
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown nginx:nginx /var/run/nginx.pid

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
