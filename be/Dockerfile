# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy root workspace package definitions
COPY package.json tsconfig.json ./
COPY shared ./shared
COPY be ./be

# Install dependencies and build shared library + backend
RUN npm install
RUN npm --workspace=shared run build
RUN npm --workspace=be run db:generate
RUN npm --workspace=be run build

# Stage 2: Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
RUN addgroup -S wrapfit && adduser -S wrapfit -G wrapfit

# Copy package descriptors and built artifacts
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/be/package.json ./be/package.json
COPY --from=builder /app/be/node_modules ./be/node_modules
COPY --from=builder /app/be/dist ./be/dist
COPY --from=builder /app/be/prisma ./be/prisma

USER wrapfit:wrapfit

EXPOSE 5000

ENV PORT=5000

CMD ["node", "be/dist/index.js"]
