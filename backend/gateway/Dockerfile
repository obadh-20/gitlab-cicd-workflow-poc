FROM node:22-alpine
WORKDIR /app
COPY gateway/package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY gateway/src ./src
ENV NODE_ENV=production
USER node
EXPOSE 8000
CMD ["node", "src/server.js"]
