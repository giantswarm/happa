FROM golang:1.16.2 AS builder
ENV GO111MODULE=on

COPY scripts/start.go start.go
RUN CGO_ENABLED=0 GOOS="linux" go build -o /start start.go

FROM quay.io/giantswarm/alpine:3.12 AS compress

RUN apk --no-cache add findutils gzip

# Copy happa built static files.
COPY dist /www

RUN find /www \
  -type f -regextype posix-extended \
  -size +512c \
  -iregex '.*\.(css|csv|html?|js|svg|txt|xml|json|webmanifest|ttf)' \
  -exec gzip -9 -k '{}' \;

FROM quay.io/giantswarm/nginx:1.18-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder --chown=nginx /start /
COPY --from=compress --chown=nginx /www /www
COPY --chown=nginx VERSION /

RUN chmod u=rwx /www
RUN touch /etc/nginx/resolvers.conf && chown nginx:nginx /etc/nginx/resolvers.conf

USER nginx

CMD ["/start"]
