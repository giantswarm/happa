#!/bin/sh
if [ -n "$API_ENDPOINT" ]; then
  sed -i "s|apiEndpoint: 'http://localhost:9000'|apiEndpoint: '$API_ENDPOINT'|" /www/index.html
fi

if [ -n "$PASSAGE_ENDPOINT" ]; then
  sed -i "s|passageEndpoint: 'http://localhost:5001'|passageEndpoint: '$PASSAGE_ENDPOINT'|" /www/index.html
fi

# Completely remove intercom in production if there is no intercom app id set.
if [ -n "$INTERCOM_APP_ID" ]; then
  sed -i "s|intercomAppId: 'bdvx0cb8'|intercomAppId: '$INTERCOM_APP_ID'|" /www/index.html
else
  sed -i "s|intercomAppId: 'bdvx0cb8',||" /www/index.html
  sed -i '/.*Intercom Start.*/,/.*Intercom End.*/d' /www/index.html
fi

if [ -n "$DOMAIN_VALIDATOR_ENDPOINT" ]; then
  sed -i "s|domainValidatorEndpoint: 'http://localhost:5002'|domainValidatorEndpoint: '$DOMAIN_VALIDATOR_ENDPOINT'|" /www/index.html
fi

if [ -n "$CREATE_CLUSTER_WORKER_TYPE" ]; then
  sed -i "s|createClusterWorkerType: 'kvm'|createClusterWorkerType: '$CREATE_CLUSTER_WORKER_TYPE'|" /www/index.html
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
