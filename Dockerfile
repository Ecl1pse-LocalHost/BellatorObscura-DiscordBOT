# --- Stage 1: Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency files first for caching
COPY package*.json ./
COPY tsconfig*.json ./

RUN npm ci

# Copy source code and compile TypeScript
COPY . .
RUN npm run build

# --- Stage 2: Production runtime ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
# Install production dependencies only
RUN npm ci --only=production

# Copy compiled JavaScript output from builder stage (adjust 'dist' if your outDir is different)
COPY --from=builder /app/dist ./

CMD ["node", "dist/index.js"]