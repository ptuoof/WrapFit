# ===================================================
# Stage 1: Build Stage (Monorepo shared & Next.js frontend)
# ===================================================
FROM node:20-alpine AS builder
WORKDIR /app

# Layer 1: Copy workspace descriptors for caching
COPY package.json package-lock.json tsconfig.json ./
COPY shared/package.json ./shared/
COPY be/package.json ./be/
COPY fe/package.json ./fe/

# Install dependencies for all workspaces
RUN npm install

# Layer 2: Copy and build shared domain package
COPY shared ./shared
RUN npm run build:shared

# Layer 3: Copy frontend source and build Next.js
COPY fe ./fe

# In Next.js, NEXT_PUBLIC_* variables are inlined at build time
ARG NEXT_PUBLIC_API_URL=http://localhost:5000/api
ARG NEXT_PUBLIC_APP_NAME="WrapFit Studio"
ARG NEXT_PUBLIC_SITE_URL=http://localhost:3000

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_NAME=$NEXT_PUBLIC_APP_NAME
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN npm --workspace=fe run build

# ===================================================
# Stage 2: Production Runtime Stage
# ===================================================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Security: non-root user
RUN addgroup -S wrapfit && adduser -S wrapfit -G wrapfit

COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/shared ./shared
COPY --from=builder /app/fe ./fe

USER wrapfit:wrapfit

EXPOSE 3000

# Run Next.js production server binding to all interfaces
CMD ["npm", "--workspace=fe", "run", "start", "--", "-p", "3000", "-H", "0.0.0.0"]
