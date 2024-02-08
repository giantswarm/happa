FROM quay.io/giantswarm/alpine:3.18.4 AS build-nginx

RUN apk add --no-cache nginx nginx-mod-http-lua
RUN mkdir -p /run/nginx

FROM quay.io/giantswarm/alpine:3.18.3 AS compress

RUN apk --no-cache add findutils gzip

# Copy happa built static files.
COPY dist /www

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM quay.io/giantswarm/nginx:1.23-alpine

ENV NODE_VERSION 16.7.0

RUN apk add --no-cache binutils libstdc++ build-base pcre pcre-dev
RUN curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64-musl.tar.xz"; \
      tar -xJf "node-v$NODE_VERSION-linux-x64-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
      && ln -s /usr/local/bin/node /usr/local/bin/nodejs;

COPY nginx /etc/nginx/
COPY --chown=nginx tsconfig.json/ /tsconfig.json
COPY --chown=nginx scripts/ /scripts
COPY --from=compress --chown=nginx /www /www

RUN npm install -g typescript ts-node ejs @types/ejs tslib @types/node js-yaml @types/js-yaml dotenv
RUN cd /scripts && npm link ejs @types/ejs js-yaml @types/js-yaml dotenv
RUN chown -R nginx:nginx /scripts/

RUN chown -R nginx:nginx /var/log/nginx/

RUN chmod u=rwx /www
RUN touch /etc/nginx/resolvers.conf && chown nginx:nginx /etc/nginx/resolvers.conf
RUN echo resolver $(awk '/^nameserver/{print $2}' /etc/resolv.conf) ";" > /etc/nginx/resolvers.conf

COPY --from=build-nginx /usr/local/nginx/modules/ngx_http_lua_module.so /usr/lib/nginx/modules/
COPY --from=build-nginx /usr/local/lib/libluajit* /usr/local/lib/

ENV LD_LIBRARY_PATH=/usr/local/lib:$LD_LIBRARY_PATH
COPY --from=build-nginx /etc/nginx/nginx.conf /etc/nginx/nginx.conf

USER root

RUN mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak && \
    { \
    echo 'load_module modules/ngx_http_lua_module.so;'; \
    cat /etc/nginx/nginx.conf.bak; \
    } > /etc/nginx/nginx.conf

USER nginx

ENTRYPOINT ["sh", "-c", "scripts/prepare.ts && exec \"$@\"", "sh"]
CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
