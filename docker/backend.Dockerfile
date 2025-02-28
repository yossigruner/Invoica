# Build stage
FROM node:20-alpine as builder

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package files
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY server/ .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install OpenSSL for Prisma
RUN apk add --no-cache libc6-compat openssl

# Copy package files and install production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copy built files and Prisma schema
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main"] 