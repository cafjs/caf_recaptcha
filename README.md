# Caf.js

Co-design cloud assistants with your web app and IoT devices.

See https://www.cafjs.com

## Library for Recaptcha Token Validation

[![Build Status](https://github.com/cafjs/caf_recaptcha/actions/workflows/push.yml/badge.svg)](https://github.com/cafjs/caf_recaptcha/actions/workflows/push.yml)

This repository contains a `Caf.js` library that validates recaptcha tokens with a cloud service.

## Dependencies Warning

To eliminate expensive dependencies for apps in the workspace that do not need `caf_recaptcha`, the package `recaptcha2@^1.3.3` has been declared as an optional dependency even though it is always needed.

Applications that depend on `caf_recaptcha` should also include `recaptcha2@^1.3.3` in package.json as a normal dependence.

## API

See {@link module:caf_recaptcha/proxy_recaptcha}

## Configuration

### framework.json

See {@link module:caf_recaptcha/plug_recaptcha}

### ca.json

See {@link module:caf_recaptcha/plug_ca_recaptcha}
