FROM nginx:1.11
RUN rm -r /etc/nginx/conf.d
ADD dist /www
ADD nginx.conf /etc/nginx/
ADD start.sh /etc/nginx/
CMD ["/etc/nginx/start.sh"]