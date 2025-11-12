FROM node:18-alpine AS builder
WORKDIR /app

# 1. Skip downloading Chrome in the builder (saves time/space)
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

COPY package.json package-lock.json* ./
RUN npm ci --production=false --silent || npm install --silent
COPY . .
RUN npm run build

FROM node:18-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# 2. Install Chromium and required fonts manually
# 'chromium' is the browser
# 'nss', 'freetype', etc. are libraries needed to run it
# 'ttf-freefont' ensures text renders correctly in the PDF
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      harfbuzz \
      ca-certificates \
      ttf-freefont

# 3. Tell Puppeteer to use the installed Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

COPY package.json package-lock.json* ./
RUN npm ci --production --silent || npm install --production --silent
COPY --from=builder /app/dist ./dist
COPY template ./template
COPY assets ./assets

EXPOSE 3000
CMD ["node", "dist/server.js"]