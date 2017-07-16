FROM nginx:1.11
RUN rm -r /etc/nginx/conf.d
ADD dist /www
ADD nginx.conf /etc/nginx/
ADD start.sh /
ADD test/certs /etc/nginx/certs
CMD ["/start.sh"]
