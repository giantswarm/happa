#!/bin/bash
if [ -n "$API_ENDPOINT" ]; then
  sed -i "s|apiEndpoint: 'http://docker.dev:9000'|apiEndpoint: '$API_ENDPOINT'|" /www/index.html
fi

if [ -n "$PASSAGE_ENDPOINT" ]; then
  sed -i "s|passageEndpoint: 'http://docker.dev:5000'|passageEndpoint: '$PASSAGE_ENDPOINT'|" /www/index.html
fi

if [ -n "$DESMOTES_ENDPOINT" ]; then
  sed -i "s|desmotesEndpoint: 'http://docker.dev:9001'|desmotesEndpoint: '$DESMOTES_ENDPOINT'|" /www/index.html
fi

if [ -n "$INTERCOM_APP_ID" ]; then
  sed -i "s|intercomAppId: 'bdvx0cb8'|intercomAppId: '$INTERCOM_APP_ID'|" /www/index.html
fi

if [ -n "$DOMAIN_VALIDATOR_ENDPOINT" ]; then
  sed -i "s|domainValidatorEndpoint: 'http://docker.dev:5001'|domainValidatorEndpoint: '$DOMAIN_VALIDATOR_ENDPOINT'|" /www/index.html
fi

sed -i "s|VERSION|$(cat /www/VERSION)|" /etc/nginx/nginx.conf

nginx -g "daemon off;"