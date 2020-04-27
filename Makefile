.PHONY: install install-node install-php client clean

# Set up and build the entire project
all: install client

# Install all project dependencies
install: install-node install-php

# Install Node dependencies
install-node:
	npm install

# Install PHP dependencies
install-php:
	composer install

# Build the frontend client
client:
	npm run build:styles
	npm run build:editor

# Clean the build directory
clean:
	rm -rf build
