FROM node:lts-alpine as build

# Create app directory
RUN mkdir -p /app/front-end

# Copy only package.json and package-lock.json to use Docker layer caching
COPY ./Frontend/package*.json /app/front-end/
WORKDIR /app/front-end

# Clean npm cache to avoid potential issues with cache
RUN npm cache clean --force

# Install dependencies and run build
RUN npm install
COPY ./Frontend /app/front-end
RUN npm run build

FROM nginx:1.25.3

# Remove the default Nginx html files
RUN rm -rf /var/www/html
RUN mkdir -p /etc/nginx/ssl

# Copy built files from the Node.js build stage
COPY --from=build /app/front-end/dist /var/www/html

# Nginx configuration and script setup
COPY ./nginx/https.conf /etc/nginx/https.conf
COPY ./nginx/launch_nginx.sh /etc/nginx/launch_nginx.sh
RUN chmod +x /etc/nginx/launch_nginx.sh

# Expose the desired port
EXPOSE 8000

COPY ./nginx/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
CMD ["/entrypoint.sh"]
