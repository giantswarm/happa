FROM quay.io/giantswarm/alpine:3.18.4 AS build-nginx

RUN apk add --no-cache gcc libc-dev make openssl-dev pcre-dev zlib-dev linux-headers curl gd-dev geoip-dev libxslt-dev perl-dev lua-dev

ENV NGINX_VERSION 1.23.1
ENV NDK_VERSION 0.3.1
ENV LUA_MODULE_VERSION 0.10.15

RUN curl -fSL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar zxvf - -C /tmp \
    && curl -fSL https://github.com/simpl/ngx_devel_kit/archive/v${NDK_VERSION}.tar.gz | tar zxvf - -C /tmp \
    && curl -fSL https://github.com/openresty/lua-nginx-module/archive/v${LUA_MODULE_VERSION}.tar.gz | tar zxvf - -C /tmp

RUN set -x \
    && cd /tmp/nginx-${NGINX_VERSION} \
    && ./configure --with-compat --add-dynamic-module=/tmp/ngx_devel_kit-${NDK_VERSION} --add-dynamic-module=/tmp/lua-nginx-module-${LUA_MODULE_VERSION} \
    && make modules || { echo 'Configure or make failed'; exit 1; }


RUN cd /tmp/nginx-$NGINX_VERSION \
    && ./configure \
        --with-compat \
        --add-dynamic-module=/tmp/ngx_devel_kit-$NDK_VERSION \
        --add-dynamic-module=/tmp/lua-nginx-module-$LUA_MODULE_VERSION \
    && make modules
FROM quay.io/giantswarm/alpine:3.18.4 AS compress

RUN apk --no-cache add findutils gzip

COPY dist /www

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM quay.io/giantswarm/nginx:1.23-alpine

ENV NODE_VERSION 16.7.0
COPY --from=build-nginx /tmp/nginx-$NGINX_VERSION/objs/ngx_http_lua_module.so /usr/lib/nginx/modules/ngx_http_lua_module.so
COPY --from=build-nginx /tmp/nginx-$NGINX_VERSION/objs/ndk_http_module.so /usr/lib/nginx/modules/ndk_http_module.so

RUN apk add --no-cache binutils libstdc++
RUN curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64-musl.tar.xz" \
    && tar -xJf "node-v$NODE_VERSION-linux-x64-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

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

RUN echo 'load_module modules/ndk_http_module.so;' >> /etc/nginx/nginx.conf \
    && echo 'load_module modules/ngx_http_lua_module.so;' >> /etc/nginx/nginx.conf

USER nginx

ENTRYPOINT ["sh", "-c", "scripts/prepare.ts && exec \"$@\"", "sh"]

CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
