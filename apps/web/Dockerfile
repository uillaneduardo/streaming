FROM nginx:1.27-alpine
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY apps/web/index.html /usr/share/nginx/html/index.html
COPY apps/web/styles.css /usr/share/nginx/html/styles.css
COPY apps/web/app.js /usr/share/nginx/html/app.js
COPY apps/web/assets/ /usr/share/nginx/html/assets/
# Reproducible version of actual assets inside the container, not the Git working tree
RUN set -eu; \
    fingerprint="$(sha256sum /usr/share/nginx/html/app.js /usr/share/nginx/html/styles.css /usr/share/nginx/html/index.html | sha256sum | cut -c1-12)"; \
    sed -i "s@./styles.css@./styles.css?v=${fingerprint}@; s@./app.js@./app.js?v=${fingerprint}@" /usr/share/nginx/html/index.html; \
    printf '{"version":"%s","frontend":"cenalivre-web","assets":"verified"}\n' "$fingerprint" > /usr/share/nginx/html/version.json
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
