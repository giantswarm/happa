#!/bin/bash
if [ -n "$ENABLE_TRACKING" ]; then
  sed -i "s/enableTracking: false/enableTracking: true/" /www/index.html
  sed -i "s/enableTracking: false/enableTracking: true/" /www-servicemonitor/index.html

  sed -i '/<!-- trackingTopReplace -->/ r /www/replacements/tracking_top.html' /www/index.html
  sed -i '/<!-- trackingBottomReplace -->/ r /www/replacements/tracking_bottom.html' /www/index.html

  sed -i '/<!-- trackingTopReplace -->/ r /www-servicemonitor/replacements/tracking_top.html' /www-servicemonitor/index.html
  sed -i '/<!-- trackingBottomReplace -->/ r /www-servicemonitor/replacements/tracking_bottom.html' /www-servicemonitor/index.html
fi

if [ -n "$DEFAULT_API_ENDPOINT" ]; then
  sed -i "s|defaultApiEndpoint: 'https://api.giantswarm.io'|defaultApiEndpoint: '$DEFAULT_API_ENDPOINT'|" /www/index.html
  sed -i "s|defaultApiEndpoint: 'https://api.giantswarm.io'|defaultApiEndpoint: '$DEFAULT_API_ENDPOINT'|" /www-servicemonitor/index.html
fi


nginx -g "daemon off;"