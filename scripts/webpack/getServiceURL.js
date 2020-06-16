// This helps the proxyPlugin and webpack.common.js to determine the service url
// using opsctl. It caches the opsctl result in memory.

const { execSync } = require('child_process');
const yaml = require('js-yaml');
const chalk = require('chalk');

let cache;

const getInstallationInfo = function (installation) {
  if (cache) {
    console.log(
      chalk.yellow(
        `📡  [opsctl] Using cached installation info for: ${installation}`
      )
    );
    return cache;
  }

  console.log(
    chalk.yellow(`📡  [opsctl] Fetching installation info for: ${installation}`)
  );

  const installationInfoYAML = execSync(
    `opsctl show cluster -i ${installation}`,
    { encoding: 'utf-8' }
  );
  const installationInfo = yaml.safeLoad(installationInfoYAML);

  cache = installationInfo;
  console.log(chalk.yellow(`📡  [opsctl] Done`));

  return cache;
};

const getServiceURL = (installation, service) => {
  const installationInfo = getInstallationInfo(installation);

  const { scheme, host } = installationInfo.services[service];
  return scheme + '://' + host;
};

module.exports = getServiceURL;
