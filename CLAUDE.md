# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `make all` - Set up and build the entire project (installs dependencies + builds client)
- `make install` - Install all project dependencies (Node + PHP)
- `make client` - Build the frontend client using pnpm
- `pnpm build` - Build all JS/CSS assets for production
- `pnpm test` - Run JavaScript unit tests

### Linting & Code Quality
- `npm run lint:all` - Run all linting (JavaScript + Styles)
- `npm run lint:js` - Lint JavaScript files in ./client
- `npm run lint:styles` - Lint SCSS files
- `npm run format:js` - Format JavaScript files
- `make phpcs` - Run PHP Code Sniffer (via Docker)
- `make phpcbf` - Run PHP Code Beautifier and Fixer (via Docker)

### Testing
- `make phpunit` - Run PHP unit tests (via Docker)
- `pnpm test` - Run JavaScript unit tests using Jest

### Docker Development
- `make docker_build` - Build Docker containers
- `make docker_up` - Start Docker development environment
- `make docker_down` - Stop Docker containers
- `make docker_sh` - Access WordPress container shell
- `make docker_install` - Install plugin in Docker environment

## Architecture Overview

This is a WordPress plugin that provides Gutenberg blocks for creating polls, surveys, and feedback forms using the Crowdsignal service.

### Key Components

**Frontend (client/):**
- Block editor implementations for each form type (poll, vote, applause, nps, feedback)
- React components and hooks for form interactions
- SCSS stylesheets for each block type
- State management using WordPress data stores

**Backend (PHP):**
- Block registration and server-side rendering
- REST API controllers for form submissions and data retrieval
- Authentication system for Crowdsignal API
- Data models for polls, surveys, and responses
- Admin interface for plugin settings and setup

**Block Types:**
- Poll Block - Multiple choice polls with results display
- Vote Block - Simple up/down voting
- Applause Block - Clapping interaction
- NPS Block - Net Promoter Score surveys
- Feedback Block - Feedback collection forms
- CS Embed Block - Embed external Crowdsignal forms

### Build System
- Uses `@wordpress/scripts` for JavaScript bundling
- Separate build processes for each block type
- SCSS compilation using node-sass
- Production builds concatenate all assets

### Testing
- JavaScript tests use Jest with WordPress mocks
- PHP tests use PHPUnit with WordPress test framework
- Docker environment for integration testing

### Code Standards
- Follows WordPress coding standards (WPCS)
- PHP 5.6+ compatibility required
- ESLint for JavaScript linting
- Uses WordPress text domain: `crowdsignal-forms`

### Security & Authorization
- **Post-based authorization**: Users can only edit polls/surveys in posts they have edit permissions for
- **Authorization Helper**: `Authorization_Helper` class provides centralized permission checking
- **WordPress-standard permissions**: Uses `current_user_can('edit_post', $post_id)` for granular control
- **Applies to all item types**: Polls, NPS surveys, feedback forms, vote blocks, applause blocks

## Important Notes

- The plugin requires connection to Crowdsignal.com API for functionality
- All blocks are designed to work within the WordPress Gutenberg editor
- Uses pnpm as the package manager (not npm/yarn)
- Docker setup is available for local development
- Release process is automated via `make release`