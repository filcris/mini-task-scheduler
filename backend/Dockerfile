# BACKEND Dockerfile — Debian + OpenSSL (fix Prisma engines)
FROM node:20-bookworm-slim AS deps
ENV NODE_ENV=development
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates bash   && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
COPY prisma ./prisma
RUN if [ -f package-lock.json ]; then npm ci; else npm install --no-audit --no-fund; fi

FROM node:20-bookworm-slim AS build
ENV NODE_ENV=development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production
WORKDIR /app
RUN apt-get update -y && apt-get install -y --no-install-recommends openssl ca-certificates bash   && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/package.json ./
RUN if [ -f /app/package-lock.json ]; then cp /app/package-lock.json ./package-lock.json; fi
COPY --from=build /app/prisma ./prisma
ENV PRISMA_SKIP_POSTINSTALL=1
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev --no-audit --no-fund; fi
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=build /app/dist ./dist
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/main.js"]
