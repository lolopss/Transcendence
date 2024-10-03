#!/bin/bash
mv /etc/nginx/https.conf /etc/nginx/nginx.conf
/etc/nginx/launch_nginx.sh

exec nginx -g 'daemon off;'