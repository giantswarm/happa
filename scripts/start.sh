#!/bin/sh

set -eu

# This script replaces some placeholders in index.html with values from the
# environment. It is used for Happa's production deployment.
if [ -n "$API_ENDPOINT" ]; then
  sed -i "s|apiEndpoint: .*|apiEndpoint: '$API_ENDPOINT',|" /www/index.html
fi

if [ -n "$MAPI_ENDPOINT" ]; then
  sed -i "s|mapiEndpoint: .*|mapiEndpoint: '$MAPI_ENDPOINT',|" /www/index.html
fi

if [ -n "$AUDIENCE" ]; then
  sed -i "s|audience: .*|audience: '$AUDIENCE',|" /www/index.html
fi

if [ -n "$MAPI_AUDIENCE" ]; then
  sed -i "s|mapiAudience: .*|mapiAudience: '$MAPI_AUDIENCE',|" /www/index.html
fi

if [ -n "$PASSAGE_ENDPOINT" ]; then
  sed -i "s|passageEndpoint: .*|passageEndpoint: '$PASSAGE_ENDPOINT',|" /www/index.html
fi

if [ -n "$INGRESS_BASE_DOMAIN" ]; then
  sed -i "s|ingressBaseDomain: .*|ingressBaseDomain: '$INGRESS_BASE_DOMAIN',|" /www/index.html
fi

if [ "$PROVIDER" = "aws" ]; then
  if [ -n "$AWS_CAPABILITIES_JSON" ]; then
    sed -i "s|awsCapabilitiesJSON: .*|awsCapabilitiesJSON: '$AWS_CAPABILITIES_JSON',|" /www/index.html
  fi
fi

if [ "$PROVIDER" = "azure" ]; then
  if [ -n "$AZURE_CAPABILITIES_JSON" ]; then
    sed -i "s|azureCapabilitiesJSON: .*|azureCapabilitiesJSON: '$AZURE_CAPABILITIES_JSON',|" /www/index.html
  fi
fi

if [ -n "$DEFAULT_REQUEST_TIMEOUT_SECONDS" ]; then
  sed -i "s|defaultRequestTimeoutSeconds: .*|defaultRequestTimeoutSeconds: $DEFAULT_REQUEST_TIMEOUT_SECONDS,|" /www/index.html
fi

if [ -n "$ENVIRONMENT" ]; then
  sed -i "s|environment: .*|environment: '$ENVIRONMENT',|" /www/index.html
else
  sed -i "s|environment: .*|environment: 'docker-container',|" /www/index.html
fi

if [ -n "$MAPI_AUTH_REDIRECT_URL" ]; then
  sed -i "s|mapiAuthRedirectURL: .*|mapiAuthRedirectURL: '$MAPI_AUTH_REDIRECT_URL',|" /www/index.html
fi

if [ -n "$MAPI_AUTH_ADMIN_GROUP" ]; then
  sed -i "s|mapiAuthAdminGroup: .*|mapiAuthAdminGroup: '$MAPI_AUTH_ADMIN_GROUP',|" /www/index.html
fi

if [ -n "$SENTRY_DSN" ]; then
  sed -i "s|sentryDsn: .*|sentryDsn: '$SENTRY_DSN',|" /www/index.html
fi

if [ -n "$SENTRY_ENVIRONMENT" ]; then
  sed -i "s|sentryEnvironment: .*|sentryEnvironment: '$SENTRY_ENVIRONMENT',|" /www/index.html
fi

if [ -n "$SENTRY_RELEASE_VERSION" ]; then
  sed -i "s|sentryReleaseVersion: .*|sentryReleaseVersion: '$SENTRY_RELEASE_VERSION',|" /www/index.html
fi

if [ "$SENTRY_DEBUG" = "TRUE" ]; then
  sed -i "s|sentryDebug: .*|sentryDebug: true,|" /www/index.html
else
  sed -i "s|sentryDebug: .*|sentryDebug: false,|" /www/index.html
fi

if [ -n "$SENTRY_SAMPLE_RATE" ]; then
  sed -i "s|sentrySampleRate: .*|sentrySampleRate: $SENTRY_SAMPLE_RATE,|" /www/index.html
fi

if [ "$FEATURE_MONITORING" = "TRUE" ]; then
  sed -i "s|FEATURE_MONITORING: .*|FEATURE_MONITORING: true,|" /www/index.html
else
  sed -i "s|FEATURE_MONITORING: .*|FEATURE_MONITORING: false,|" /www/index.html
fi

if [ "$FEATURE_MAPI_AUTH" = "TRUE" ]; then
  sed -i "s|FEATURE_MAPI_AUTH: .*|FEATURE_MAPI_AUTH: true,|" /www/index.html
else
  sed -i "s|FEATURE_MAPI_AUTH: .*|FEATURE_MAPI_AUTH: false,|" /www/index.html
fi

if [ "$FEATURE_MAPI_CLUSTERS" = "TRUE" ]; then
  sed -i "s|FEATURE_MAPI_CLUSTERS: .*|FEATURE_MAPI_CLUSTERS: true,|" /www/index.html
else
  sed -i "s|FEATURE_MAPI_CLUSTERS: .*|FEATURE_MAPI_CLUSTERS: false,|" /www/index.html
fi

# This sets the VERSION placeholder in the footer to the version specified in the
# VERSION file.
VERSION=$(cat VERSION | tr '\n' ' ' | tr -d '[:space:]')

# Set version in config object
sed -i "s|happaVersion: .*|happaVersion: '${VERSION}',|g" /www/index.html
# Set version in metadata.json
sed -i "s|\"version\": .*|\"version\": \"$VERSION\"|" /www/metadata.json

# Enable real user monitoring (RUM)
if [ "$ENABLE_RUM" = "TRUE" ]; then
  echo "RUM is enabled."
  sed -i "s|enableRealUserMonitoring: .*|enableRealUserMonitoring: true,|" /www/index.html
else
  sed -i "s|enableRealUserMonitoring: .*|enableRealUserMonitoring: false,|" /www/index.html
fi

# gzip index.html again because we changed it
gzip -f -9 -k /www/index.html
# gzip metadata.json again because we changed it
gzip -f -9 -k /www/metadata.json

# Create file to include into nginx config to use
# the pods nameserver as resolver
echo resolver $(awk '/^nameserver/{print $2}' /etc/resolv.conf) ";" > /etc/nginx/resolvers.conf

echo ""
echo "--- Starting Happa nginx server ---"
exec nginx -c /etc/nginx/nginx.conf -g "daemon off;"
