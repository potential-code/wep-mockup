# syntax=docker/dockerfile:1

# WEPs portal mockup: Vite/React SPA built once with bun, then served by nginx.
#
#   docker build -t wep-mockup .

##############################################################################
# Stage 1: build the static bundle
##############################################################################
FROM oven/bun:1.3 AS builder

WORKDIR /app

# Manifests first so the install layer stays cached until a dependency changes.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

# Typecheck + vite build (see package.json). The basic-auth Vite plugin only
# guards dev/preview servers; nginx takes over that job in the runtime image.
RUN bun run build

##############################################################################
# Stage 2: serve
##############################################################################
FROM nginx:1.29-alpine AS runtime

# htpasswd, for the Basic auth file rebuilt on each start.
RUN apk add --no-cache apache2-utils

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/basic-auth.sh /docker-entrypoint.d/20-basic-auth.sh

# Fail closed: if the entrypoint script never runs, every guarded location
# answers 503 instead of serving the site unprotected.
RUN chmod +x /docker-entrypoint.d/20-basic-auth.sh \
    && printf 'return 503;\n' > /etc/nginx/basic-auth.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1/healthz || exit 1
