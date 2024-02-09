FROM quay.io/giantswarm/alpine:3.18.3 AS compress
RUN apk --no-cache add findutils gzip
COPY dist /www
RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM quay.io/giantswarm/alpine:3.18.3 as nginx-builder

ENV NGINX_VERSION=1.23.4 \
    NGX_DEVEL_KIT_VERSION=0.3.2 \
    LUA_NGINX_MODULE_VERSION=0.10.24 \
    LUAJIT_VERSION=2.1.0-beta3

RUN apk update && apk add --no-cache \
    gcc \
    libc-dev \
    make \
    openssl-dev \
    pcre-dev \
    zlib-dev \
    linux-headers \
    curl \
    gd-dev \
    geoip-dev \
    libxslt-dev \
    perl-dev \
    luajit-dev \
    luajit \
    lua-resty-core \
    pcre

RUN curl -fSL https://luajit.org/download/LuaJIT-${LUAJIT_VERSION}.tar.gz | tar xz -C /tmp \
    && cd /tmp/LuaJIT-${LUAJIT_VERSION} \
    && make \
    && make install

# Set environment variables so the NGINX `./configure` script can find LuaJIT
ENV LUAJIT_LIB=/usr/local/lib
ENV LUAJIT_INC=/usr/local/include/luajit-2.1


RUN curl -fSL https://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz | tar xz -C /tmp \
    && curl -fSL https://github.com/simpl/ngx_devel_kit/archive/v${NGX_DEVEL_KIT_VERSION}.tar.gz | tar xz -C /tmp \
    && curl -fSL https://github.com/openresty/lua-nginx-module/archive/v${LUA_NGINX_MODULE_VERSION}.tar.gz | tar xz -C /tmp

RUN mkdir -p /usr/lib/nginx/modules

RUN cd /tmp/nginx-${NGINX_VERSION} \
    && ./configure \
        --prefix=/etc/nginx \
        --sbin-path=/usr/sbin/nginx \
        --modules-path=/usr/lib/nginx/modules \
        --with-http_ssl_module \
        --with-http_sub_module \
        --with-http_gzip_static_module \
        --with-http_stub_status_module \
        --with-http_realip_module \
        --with-http_auth_request_module \
        --with-http_v2_module \
        --with-ld-opt="-Wl,-rpath,/usr/lib" \
        --add-module=/tmp/ngx_devel_kit-${NGX_DEVEL_KIT_VERSION} \
        --add-module=/tmp/lua-nginx-module-${LUA_NGINX_MODULE_VERSION} \
    && make \
    && make install \
    && ls -la /usr/lib/nginx/

ENV NODE_VERSION 16.7.0

RUN curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64-musl.tar.xz" \
    && tar -xJf "node-v$NODE_VERSION-linux-x64-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
    && ln -s /usr/local/bin/node /usr/local/bin/nodejs

COPY nginx /etc/nginx/
COPY tsconfig.json/ /tsconfig.json
COPY scripts/ /scripts
COPY --from=compress /www /www

RUN mkdir -p /etc/nginx/logs/
RUN npm install -g typescript ts-node ejs @types/ejs tslib @types/node js-yaml @types/js-yaml dotenv
RUN cd /scripts && npm link ejs @types/ejs js-yaml @types/js-yaml dotenv

RUN chown -R nginx:nginx /www
RUN chown -R nginx:nginx /etc/nginx/logs/
RUN chmod u=rwx /www
RUN touch /etc/nginx/resolvers.conf && chown nginx:nginx /etc/nginx/resolvers.conf
RUN echo resolver $(awk '/^nameserver/{print $2}' /etc/resolv.conf) ";" > /etc/nginx/resolvers.conf
USER root

RUN mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak && \
    { \
    echo 'load_module /usr/lib/nginx/modules/ndk_http_module.so;'; \
    echo 'load_module /usr/lib/nginx/modules/ngx_http_lua_module.so;'; \
    echo 'pcre_jit on;';\
    cat /etc/nginx/nginx.conf.bak; \
    } > /etc/nginx/nginx.conf
USER nginx

ENTRYPOINT ["sh", "-c", "scripts/prepare.ts && exec \"$@\"", "sh"]
CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
