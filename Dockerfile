FROM quay.io/giantswarm/alpine:3.14.1 AS compress

RUN apk --no-cache add findutils gzip

# Copy happa built static files.
COPY dist /www

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM quay.io/giantswarm/nginx:1.21-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --chown=nginx scripts/start.sh /
COPY --from=compress --chown=nginx /www /www
COPY --chown=nginx VERSION /

RUN chmod u=rwx /www
RUN touch /etc/nginx/resolvers.conf && chown nginx:nginx /etc/nginx/resolvers.conf

USER nginx

CMD ["/start.sh"]
