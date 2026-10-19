#!/bin/sh
# Runs on every container start (nginx image entrypoint hook). Writes the
# htpasswd file from BASIC_AUTH_USER / BASIC_AUTH_PASS. If either is missing,
# the guard stays as a blanket 503 so the site is never served unprotected.
set -eu

conf=/etc/nginx/basic-auth.conf

if [ -n "${BASIC_AUTH_USER:-}" ] && [ -n "${BASIC_AUTH_PASS:-}" ]; then
  htpasswd -bcB /etc/nginx/.htpasswd "$BASIC_AUTH_USER" "$BASIC_AUTH_PASS" >/dev/null 2>&1
  printf 'auth_basic "WEPs portal mockup";\nauth_basic_user_file /etc/nginx/.htpasswd;\n' > "$conf"
  echo "basic-auth: enabled for user $BASIC_AUTH_USER"
else
  printf 'return 503;\n' > "$conf"
  echo "basic-auth: BASIC_AUTH_USER/BASIC_AUTH_PASS not set, serving 503" >&2
fi
