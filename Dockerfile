FROM nginx:1.16-alpine

RUN apk --no-cache add jq findutils gzip

COPY dist /www

RUN rm -r /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/config
COPY nginx.conf /etc/nginx/config

COPY VERSION /
COPY scripts/start.sh /

# Test certifiates will be overwritten in production by configmap
COPY test/certs /etc/nginx/certs

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

RUN chown -R nginx:nginx /www

CMD ["/start.sh"]
