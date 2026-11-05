FROM node:22-alpine
WORKDIR /app
COPY ai-control-panel/package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY ai-control-panel/src ./src
ENV NODE_ENV=production
USER node
EXPOSE 8017
CMD ["node", "src/server.js"]
