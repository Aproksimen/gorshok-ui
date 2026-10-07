# --- Этап 1: Сборка ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

ARG VITE_WEBHOOK_URL
ARG VITE_WEBHOOK_API_KEY
ENV VITE_WEBHOOK_URL=$VITE_WEBHOOK_URL
ENV VITE_WEBHOOK_API_KEY=$VITE_WEBHOOK_API_KEY

RUN npm run build

# --- Этап 2: Раздача ---
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
