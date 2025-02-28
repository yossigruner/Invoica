# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./

# Install dependencies (using npm install instead of ci)
RUN npm install
RUN npm install html2pdf.js@0.10.1

# Copy source code
COPY frontend/ .

# Build arguments
ARG VITE_API_URL
ARG VITE_FRONTEND_URL

# Environment variables
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_FRONTEND_URL=$VITE_FRONTEND_URL

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the built frontend files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"] 