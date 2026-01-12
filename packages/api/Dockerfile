# Stage 1: Builder
FROM oven/bun:1-alpine AS builder
WORKDIR /app

COPY package.json bun.lock ./
COPY packages/api/package.json ./packages/api/package.json
COPY packages/web/package.json ./packages/web/package.json
RUN bun install --ignore-scripts
COPY packages/api ./packages/api
WORKDIR /app/packages/api
RUN bunx prisma generate
RUN bun run build

# Install production dependencies only
WORKDIR /app
RUN rm -rf node_modules packages/api/node_modules
RUN bun install --production --ignore-scripts

# Stage 2: Runner
FROM oven/bun:1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/api/node_modules ./packages/api/node_modules
COPY --from=builder /app/packages/api/dist ./packages/api/dist
COPY --from=builder /app/packages/api/package.json ./packages/api/package.json
COPY --from=builder /app/packages/api/prisma ./packages/api/prisma
WORKDIR /app/packages/api
EXPOSE 3001

CMD ["sh", "-c", "bunx prisma migrate deploy && bun run start"] 
