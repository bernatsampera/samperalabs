FROM node:22-alpine AS deps

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json .npmrc ./
RUN npm ci

FROM node:22-alpine AS build

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json .npmrc ./
COPY . .
RUN npm run build

FROM node:22-alpine AS prod-deps

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

FROM node:22-alpine AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=4322

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/db/schema.sql ./db/schema.sql
COPY --from=build /app/public/fonts ./public/fonts
COPY package.json package-lock.json ./

RUN mkdir -p /app/data

VOLUME ["/app/data"]
EXPOSE 4322

CMD ["node", "./dist/server/entry.mjs"]
