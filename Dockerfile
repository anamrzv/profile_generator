FROM node:18-alpine AS builder
WORKDIR /app

# Install deps and build
COPY package.json package-lock.json* ./
RUN npm ci --production=false --silent || npm install --silent
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Copy only production deps and built files
COPY package.json package-lock.json* ./
RUN npm ci --production --silent || npm install --production --silent
COPY --from=builder /app/dist ./dist
COPY template ./template
COPY assets ./assets

EXPOSE 3000
CMD ["node", "dist/server.js"]
