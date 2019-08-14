#!/bin/bash

# This is the entry point for the development Dockerfile.
yarn install --non-interactive --production=false
yarn start
