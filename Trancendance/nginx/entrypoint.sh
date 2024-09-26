#!/bin/bash
mv /etc/nginx/nginx_https.conf /etc/nginx/nginx.conf
/etc/nginx/nginx_start.sh

exec nginx -g 'daemon off;'