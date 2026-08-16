FROM oven/bun:1.3.1-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM node:24.18.0-alpine3.24 AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:24.18.0-alpine3.24 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=4321
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 api
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/scripts ./scripts
RUN chown -R api:nodejs /app
USER api
EXPOSE 4321
CMD ["npm", "run", "start"]
