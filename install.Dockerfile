FROM php:7-cli
RUN docker-php-ext-install pdo pdo_mysql
CMD ["php", "/var/www/html/install.php"]
