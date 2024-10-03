#!/bin/bash

if [ ! -f /etc/ssl/certs/nginx.crt ]; then
        echo "NGINX: Setting up sll...";
        openssl req -x509 -nodes -days 365 -newkey rsa:4096 -keyout /etc/ssl/private/nginx.key -out /etc/ssl/certs/nginx.crt -subj "/C=FR/O=42LeHavre/CN=ldaniel.42.fr";
        echo "NGINX: SSL is set up !";
fi      

exec "$@"