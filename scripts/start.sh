#!/bin/sh

# This script replaces some placeholders in index.html with values from the
# environment. It is used for Happa's production deployment.
if [ -n "$API_ENDPOINT" ]; then
  sed -i "s|apiEndpoint: .*|apiEndpoint: '$API_ENDPOINT',|" /www/index.html
fi

if [ -n "$PASSAGE_ENDPOINT" ]; then
  sed -i "s|passageEndpoint: .*|passageEndpoint: '$PASSAGE_ENDPOINT',|" /www/index.html
fi

if [ -n "$INGRESS_BASE_DOMAIN" ]; then
  sed -i "s|ingressBaseDomain: .*|ingressBaseDomain: '$INGRESS_BASE_DOMAIN',|" /www/index.html
fi

if [ -n "$AWS_CAPABILITIES_JSON" ]; then
  sed -i "s|awsCapabilitiesJSON: .*|awsCapabilitiesJSON: '$AWS_CAPABILITIES_JSON',|" /www/index.html
fi

if [ -n "$AZURE_CAPABILITIES_JSON" ]; then
  sed -i "s|azureCapabilitiesJSON: .*|azureCapabilitiesJSON: '$AZURE_CAPABILITIES_JSON',|" /www/index.html
fi

if [ -n "$ENVIRONMENT" ]; then
  sed -i "s|environment: .*|environment: '$ENVIRONMENT',|" /www/index.html
else
  sed -i "s|environment: .*|environment: 'docker-container',|" /www/index.html
fi

# This sets the VERSION placeholder in the footer to the version specified in the
# VERSION file.
VERSION=$(cat VERSION | tr '\n' ' ' | tr -d '[:space:]')

STRLENGTH=$(echo -n $VERSION | wc -m)
if [ $STRLENGTH -gt 30 ]; then
  # VERSION is a commit hash, not a tag
  SHORTVERSION=$(echo -n $VERSION | cut -c-5)
  VERSION="<a href=\"https://github.com/giantswarm/happa/commit/${VERSION}\">${SHORTVERSION}</a>"
fi

sed -i "s|VERSION|${VERSION}|g" /www/index.html

echo ""
echo "--- Starting Happa nginx server ---"
exec nginx -c /etc/nginx/config/nginx.conf -g "daemon off;"
