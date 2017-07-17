FROM nginx:1.11
RUN rm -r /etc/nginx/conf.d
ADD dist /www
RUN mkdir -p /etc/nginx/config
ADD nginx.conf /etc/nginx/config
ADD start.sh /
ADD test/certs /etc/nginx/certs
CMD ["/start.sh"]
