# ===================================================
# Stage 1: Build Stage (Monorepo shared & backend)
# ===================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Install build dependencies required by Prisma engine
RUN apk add --no-cache openssl

# Layer 1: Copy workspace descriptors for optimal caching
COPY package.json package-lock.json tsconfig.json ./
COPY shared/package.json ./shared/
COPY be/package.json ./be/
COPY fe/package.json ./fe/

# Install dependencies for all workspaces
RUN npm install

# Layer 2: Copy and build shared domain package
COPY shared ./shared
RUN npm run build:shared

# Layer 3: Copy backend source, generate Prisma client, and compile TypeScript
COPY be ./be
RUN npm --workspace=be run db:generate
RUN npm --workspace=be run build

# ===================================================
# Stage 2: Production Runtime Stage
# ===================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN apk add --no-cache openssl

# Security: create non-root user
RUN addgroup -S wrapfit && adduser -S wrapfit -G wrapfit

# Copy node_modules and built artifacts
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/be/package.json ./be/package.json
COPY --from=builder /app/be/dist ./be/dist
COPY --from=builder /app/be/prisma ./be/prisma
COPY be/docker-entrypoint.sh ./be/docker-entrypoint.sh

# Ensure uploads directory exists, normalize line endings for shell script, and set ownership
RUN mkdir -p /app/uploads/assets /app/uploads/exports && \
    sed -i 's/\r$//' ./be/docker-entrypoint.sh && \
    chmod +x ./be/docker-entrypoint.sh && \
    chown -R wrapfit:wrapfit /app

USER wrapfit:wrapfit

EXPOSE 5000
ENV PORT=5000

ENTRYPOINT ["./be/docker-entrypoint.sh"]
