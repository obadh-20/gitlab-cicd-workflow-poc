FROM node:22-alpine
WORKDIR /app
COPY administration/package*.json ./
RUN npm ci --omit=dev --ignore-scripts --no-audit --no-fund
COPY administration/src ./src
ENV NODE_ENV=production
USER node
EXPOSE 8010
CMD ["node", "src/server.js"]
