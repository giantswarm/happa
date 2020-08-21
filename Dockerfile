FROM nginx:1.16-alpine

RUN apk --no-cache add findutils gzip && \
  rm -r /etc/nginx/conf.d && \
  mkdir -p /etc/nginx/config

COPY nginx.conf /etc/nginx/config
COPY scripts/start.sh /
COPY dist /www
COPY VERSION /

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

RUN chown -R nginx:nginx /www
RUN chmod -R u=rwx /www

USER nginx

CMD ["/start.sh"]
