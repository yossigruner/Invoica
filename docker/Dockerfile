# Stage 1: Build Stage
# Using Node.js Alpine for a smaller footprint and faster builds
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files first to leverage Docker cache for dependencies
COPY package*.json ./

# Use clean install for reproducible builds
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application with environment variables
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_ANON_KEY

ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY

RUN npm run build

# Stage 2: Production Stage
FROM nginx:alpine

# Copy the built files to nginx's serve directory
# This contains only the necessary production files, reducing image size
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom favicon
COPY public/favicon.ico /usr/share/nginx/html/favicon.ico

# Copy our custom nginx configuration
# This config includes:
# - Gzip compression for better performance
# - SPA routing support
# - Security headers
# - Caching rules
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Nginx uses port 80 by default
EXPOSE 80

# Start Nginx in foreground to work well with Docker
# Using daemon off ensures Docker can track the process properly
CMD ["nginx", "-g", "daemon off;"] 