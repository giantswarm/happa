import chalk from 'chalk';
import dotenv from 'dotenv';

import { IConfigurationValues } from '../getConfigurationValues';
import getServiceURL from './getServiceURL';

const envFileVars = dotenv.config().parsed;

function determineAudienceURL() {
  console.log(
    chalk.blue(
      `🛠  [AudienceURL Helper] Checking for HAPPA_PROXY_INSTALLATION or HAPPA_PROXY_BASE_DOMAIN`
    )
  );

  const { HAPPA_PROXY_INSTALLATION, HAPPA_PROXY_BASE_DOMAIN } = Object.assign(
    {},
    envFileVars,
    process.env
  );

  let apiAudienceUrl = '';
  if (HAPPA_PROXY_INSTALLATION) {
    console.log(
      chalk.blue(
        `🛠  [AudienceURL Helper] HAPPA_PROXY_INSTALLATION is ${HAPPA_PROXY_INSTALLATION}. Setting audience based on opsctl response.`
      )
    );
    apiAudienceUrl = getServiceURL(HAPPA_PROXY_INSTALLATION, 'api');
  } else if (HAPPA_PROXY_BASE_DOMAIN) {
    console.log(
      chalk.blue(
        `🛠  [AudienceURL Helper] HAPPA_PROXY_BASE_DOMAIN is ${HAPPA_PROXY_BASE_DOMAIN}. Setting the audience based on that.`
      )
    );
    apiAudienceUrl = `https://api.${HAPPA_PROXY_BASE_DOMAIN}`;
  }

  console.log(
    chalk.blue(`🛠  [AudienceURL Helper] Set audience to ${apiAudienceUrl}.`)
  );

  return apiAudienceUrl;
}

/**
 * Determine which backend endpoints to use.
 * */
export function computeEndpoints() {
  const endpoints: Pick<
    IConfigurationValues,
    | 'apiEndpoint'
    | 'mapiEndpoint'
    | 'audience'
    | 'mapiAudience'
    | 'passageEndpoint'
  > = {
    apiEndpoint: 'http://localhost:8000',
    mapiEndpoint: 'http://localhost:8888',
    audience: 'http://localhost:8000',
    mapiAudience: 'http://localhost:9999',
    passageEndpoint: 'http://localhost:5001',
  };

  const audience = determineAudienceURL();
  if (audience) {
    endpoints.audience = audience;
  }

  return endpoints;
}
