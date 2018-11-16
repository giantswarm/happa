FROM nginx:1.13-alpine

ADD dist /www

RUN rm -r /etc/nginx/conf.d
RUN mkdir -p /etc/nginx/config
ADD nginx.conf /etc/nginx/config

ADD start.sh /

# Test certifiates will be overwritten in production by configmap
ADD test/certs /etc/nginx/certs

CMD ["/start.sh"]
