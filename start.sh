#!/bin/sh
if [ -n "$API_ENDPOINT" ]; then
  sed -i "s|apiEndpoint: 'http://localhost:8000'|apiEndpoint: '$API_ENDPOINT'|" /www/index.html
fi

if [ -n "$PASSAGE_ENDPOINT" ]; then
  sed -i "s|passageEndpoint: 'http://localhost:5001'|passageEndpoint: '$PASSAGE_ENDPOINT'|" /www/index.html
fi

if [ -n "$INGRESS_BASE_DOMAIN" ]; then
  sed -i "s|ingressBaseDomain: 'k8s.sample.io'|ingressBaseDomain: '$INGRESS_BASE_DOMAIN'|" /www/index.html
fi

if [ -n "$AWS_CAPABILITIES_JSON" ]; then
  sed -i "s|awsCapabilitiesJSON: ''|awsCapabilitiesJSON: '$AWS_CAPABILITIES_JSON'|" /www/index.html
fi

if [ -n "$AZURE_CAPABILITIES_JSON" ]; then
  sed -i "s|azureCapabilitiesJSON: ''|azureCapabilitiesJSON: '$AZURE_CAPABILITIES_JSON'|" /www/index.html
fi

if [ -n "$ENVIRONMENT" ]; then
  sed -i "s|environment: 'development'|environment: '$ENVIRONMENT'|" /www/index.html
else
  sed -i "s|environment: 'development'|environment: 'docker-container'|" /www/index.html
fi

sed -i "s|version: 'development'|version: '$(cat /www/VERSION)'|" /www/index.html

sed -i "s|VERSION|$(cat /www/VERSION)|" /etc/nginx/nginx.conf

echo ""
echo "--- Starting Happa nginx server ---"
exec nginx -c /etc/nginx/config/nginx.conf -g "daemon off;"
