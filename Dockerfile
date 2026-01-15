# Container definition for portfolio API server.
# See /.server for the codebase.

FROM node:24-slim AS base
WORKDIR /app
COPY . .
RUN npm ci

WORKDIR /app/.server
RUN npm run build

ENV TINI_VERSION=v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini-static
RUN chmod +x /tini-static


FROM gcr.io/distroless/nodejs24-debian12:latest
WORKDIR /app
COPY --from=base /app/.server/dist ./dist
COPY --from=base /tini-static /tini-static

EXPOSE 3000
ENTRYPOINT ["/tini-static", "--", "/nodejs/bin/node"]
CMD ["dist/index.js"]
