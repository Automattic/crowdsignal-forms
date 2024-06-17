FROM ubuntu:focal

VOLUME ["/var/www/html"]

ENV LANG en_US.UTF-8
ENV LC_ALL en_US.UTF-8
ENV DEBIAN_FRONTEND=noninteractive

# Install required Ubuntu packages for having Apache PHP as a module
# as well a bunch of other packages
RUN \
	apt-get update \
	&& apt-get install -y language-pack-en-base software-properties-common \
	&& add-apt-repository ppa:ondrej/php \
	&& apt-get update \
	&& apt-get install -y \
		apache2 \
		curl \
		wget \
		less \
		gettext \
		libapache2-mod-php8.2 \
		libsodium23 \
		mysql-client \
		nano \
		php-apcu \
		php-xdebug \
		php8.2 \
		php8.2-common \
		php8.2-mysqli \
		php8.2-xml \
		php8.2-xmlrpc \
		php8.2-curl \
		php8.2-gd \
		php8.2-imagick \
		php8.2-cli \
		php8.2-dev \
		php8.2-imap \
		php8.2-mbstring \
		php8.2-opcache \
		php8.2-soap \
		php8.2-zip \
		php8.2-intl \
		ssmtp \
		subversion \
		sudo \
		vim \
	&& rm -rf /var/lib/apt/lists/*

# force php 8.2 since with new versions of ubuntu, new php will be enabled on cli.
RUN sudo update-alternatives --set php /usr/bin/php8.2

# Enable mod_rewrite in Apache
RUN a2enmod rewrite

# Install wp-cli
RUN curl -o /usr/local/bin/wp -SL https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar \
	&& chmod +x /usr/local/bin/wp

# Install PsySH to use in wp-cli shell
RUN curl https://psysh.org/psysh -L -o /usr/local/bin/psysh \
	&& chmod +x /usr/local/bin/psysh

# Install PHPUnit
RUN curl https://phar.phpunit.de/phpunit-9.5.phar -L -o phpunit.phar \
	&& chmod +x phpunit.phar \
	&& mv phpunit.phar /usr/local/bin/phpunit

# Copy a default config file for an apache host
COPY ./config/apache_default /etc/apache2/sites-available/000-default.conf

# Copy a default set of settings for PHP (php.ini)
COPY ./config/php.ini /etc/php/8.2/apache2/conf.d/20-jetpack-wordpress.ini
COPY ./config/php.ini /etc/php/8.2/cli/conf.d/20-jetpack-wordpress.ini

# Copy single site htaccess to tmp. run.sh will move it to the site's base dir if there's none present.
COPY ./config/htaccess /tmp/htaccess
COPY ./config/htaccess-multi /tmp/htaccess-multi

# Copy wp-tests-config to tmp. run.sh will move it to the WordPress source code base dir if there's none present.
COPY ./config/wp-tests-config.php /tmp/wp-tests-config.php

# Copy a default set of settings for SMTP.
COPY ./config/ssmtp.conf /etc/ssmtp/ssmtp.conf

# Copy our cmd bash script
COPY ./bin/run.sh /usr/local/bin/run

# Copy our composer install script
COPY ./bin/install_composer.sh /usr/local/bin/install_composer.sh

# Install composer
RUN /usr/local/bin/install_composer.sh && mv /tmp/composer.phar /usr/local/bin/composer && chmod +x /usr/local/bin/composer

# Make our cmd script be executable
RUN chmod +x /usr/local/bin/run

# Set the working directory for the next commands
WORKDIR /var/www/html

CMD ["/usr/local/bin/run"]
