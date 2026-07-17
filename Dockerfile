# NOTE: this image is currently built for linux/amd64 only (see .circleci/config.yml);
# the final nginx stage lacks npm on arm64 -- tracked in #4815.
FROM gsoci.azurecr.io/giantswarm/alpine:3.24.1 AS compress

RUN apk --no-cache add findutils gzip

# Copy happa built static files.
COPY dist /www

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM gsoci.azurecr.io/giantswarm/nginx:1.31-alpine

ENV NODE_VERSION=16.7.0

RUN apk add --no-cache binutils libstdc++
RUN curl -fsSLO --compressed "https://unofficial-builds.nodejs.org/download/release/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64-musl.tar.xz"; \
      tar -xJf "node-v$NODE_VERSION-linux-x64-musl.tar.xz" -C /usr/local --strip-components=1 --no-same-owner \
      && ln -s /usr/local/bin/node /usr/local/bin/nodejs;

COPY nginx /etc/nginx/
COPY --chown=nginx tsconfig.json/ /tsconfig.json
COPY --chown=nginx scripts/ /scripts
COPY --from=compress --chown=nginx /www /www

# Pin these to the versions happa itself declares (see package.json). Leaving
# them unpinned lets `npm install -g` float to `latest`, which broke the image
# when TypeScript 7 was published: ts-node 10.9.2 is incompatible with it, so
# scripts/prepare.ts crashed on startup and the container never served.
RUN npm install -g \
      typescript@6.0.3 \
      ts-node@10.9.2 \
      ejs@6.0.1 \
      @types/ejs@3.1.5 \
      tslib@2.8.1 \
      @types/node@24.13.2 \
      js-yaml@4.2.0 \
      @types/js-yaml@4.0.9 \
      dotenv@16.6.1
RUN cd /scripts && npm link ejs @types/ejs js-yaml @types/js-yaml dotenv
RUN chown -R nginx:nginx /scripts/

RUN chown -R nginx:nginx /var/log/nginx/

RUN chmod u=rwx /www
RUN touch /etc/nginx/resolvers.conf && chown nginx:nginx /etc/nginx/resolvers.conf
RUN echo resolver $(awk '/^nameserver/{print $2}' /etc/resolv.conf) ";" > /etc/nginx/resolvers.conf

USER nginx

ENTRYPOINT ["sh", "-c", "scripts/prepare.ts && exec \"$@\"", "sh"]

CMD ["/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf", "-g", "daemon off;"]
