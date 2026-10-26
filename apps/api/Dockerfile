FROM node:22-bookworm-slim AS build
WORKDIR /srv
COPY apps/api/package.json ./
RUN npm install --no-audit --no-fund
COPY apps/api/tsconfig.json ./
COPY apps/api/src ./src
RUN npm run build && npm prune --omit=dev
FROM node:22-bookworm-slim
ENV NODE_ENV=production PORT=3000
WORKDIR /srv
COPY --from=build /srv/node_modules ./node_modules
COPY --from=build /srv/dist ./dist
COPY --from=build /srv/package.json ./package.json
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=4s --start-period=25s CMD node -e "fetch('http://127.0.0.1:3000/api/v1/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node","dist/server.js"]
