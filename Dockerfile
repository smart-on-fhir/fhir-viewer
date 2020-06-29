FROM nginx:alpine
COPY . /usr/share/nginx/html
RUN echo 'window.KNOWN_SERVERS = [/https?\:\/\/.+/];' > /usr/share/nginx/html/known-servers.js