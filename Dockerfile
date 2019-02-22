FROM nginx:1.14-alpine

RUN apk --no-cache add jq

ADD dist /www
ADD package.json /

RUN rm -r /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/config
ADD nginx.conf /etc/nginx/config

ADD scripts/start.sh /

# Test certifiates will be overwritten in production by configmap
ADD test/certs /etc/nginx/certs

CMD ["/start.sh"]
