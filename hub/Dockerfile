# =============================================================================
# GSD Hub — Production Dockerfile
# PHP 8.3 + Apache · SQLite/MySQL · env-based config
# =============================================================================

FROM php:8.3-apache

# System dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libsqlite3-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite gd zip \
    && rm -rf /var/lib/apt/lists/*

# Apache modules
RUN a2enmod rewrite headers

WORKDIR /var/www/html

# ── Application source ────────────────────────────────────────────────────────
COPY . .

# Generate config.php from example (actual values come from env vars at runtime)
RUN if [ ! -f config/config.php ]; then cp config/config.example.php config/config.php; fi

# Fix symlink for assets in public/
RUN rm -f public/assets && ln -s ../assets public/assets

# Ensure storage directories exist with correct permissions
RUN mkdir -p storage/db storage/logs storage/uploads storage/cache \
    && chown -R www-data:www-data storage \
    && chmod -R 775 storage

# Apache: point DocumentRoot to /public
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!\${APACHE_DOCUMENT_ROOT}!g' \
    /etc/apache2/sites-available/*.conf \
    /etc/apache2/apache2.conf \
    /etc/apache2/conf-available/*.conf

# Health check endpoint — Apache must be up and index.php responding
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD curl -f http://localhost/healthz || exit 1

EXPOSE 80
