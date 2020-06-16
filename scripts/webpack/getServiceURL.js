// This helps the proxyPlugin and webpack.common.js to determine the service url
// using opsctl. It caches the opsctl result in memory.

const { execSync } = require('child_process');
const yaml = require('js-yaml');

let cache;

const getInstallationInfo = function (installation) {
  if (cache) return cache;

  const installationInfoYAML = execSync(
    `opsctl show cluster -i ${installation}`,
    { encoding: 'utf-8' }
  );
  const installationInfo = yaml.safeLoad(installationInfoYAML);

  cache = installationInfo;

  return cache;
};

const getServiceURL = (installation, service) => {
  const installationInfo = getInstallationInfo(installation);

  const { scheme, host } = installationInfo.services[service];
  return scheme + '://' + host;
};

module.exports = getServiceURL;
