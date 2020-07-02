const dotenv = require('dotenv');
const chalk = require('chalk');
const express = require('express');
const request = require('request');
const cors = require('cors');
const getServiceURL = require('./getServiceURL');

/** A webpack plugin that starts cors proxies to a production services if the HAPPA_PROXY_INSTALLATION environment variable is present.
    The url to proxy to is determined automatically using opsctl.

    For people without opsctl we also have HAPPA_PROXY_BASE_DOMAIN as an alternative.
*/
class ProxyPlugin {
  /**
   * Figures out if we want the proxies to start by checking for HAPPA_PROXY_INSTALLATION or HAPPA_PROXY_BASE_DOMAIN
   * and sets the actual URL to proxy to for each of the desired proxies based on which environment variable is set.
   * @constructor
   * @arg {Object[]} proxySetting - An array with objects that configure which services to proxy to.
   * @arg {string} proxySetting[].service - The name of the service to proxy to.
   * @arg {string} proxySetting[].localPort - The port to listen on locally.
   */
  constructor(proxies) {
    this.proxies = proxies;
    this.log(
      `Checking for HAPPA_PROXY_INSTALLATION or HAPPA_PROXY_BASE_DOMAIN`
    );

    const envFileVars = dotenv.config().parsed;

    const { HAPPA_PROXY_INSTALLATION, HAPPA_PROXY_BASE_DOMAIN } = Object.assign(
      {},
      envFileVars,
      process.env
    );

    if (!HAPPA_PROXY_INSTALLATION && !HAPPA_PROXY_BASE_DOMAIN) {
      this.log(
        `Skipping proxy setup, HAPPA_PROXY_INSTALLATION and HAPPA_PROXY_BASE_DOMAIN are not set`
      );
      this.apply = this.noopApply;
      return;
    }

    if (HAPPA_PROXY_INSTALLATION) {
      this.log(
        `HAPPA_PROXY_INSTALLATION is ${HAPPA_PROXY_INSTALLATION}. Using opsctl to find service URLs for ${proxies
          .map((p) => p.service)
          .join(', ')} `
      );
      this.proxies = this.proxies.map((p) => {
        p.URL = getServiceURL(HAPPA_PROXY_INSTALLATION, p.service);
        return p;
      });
    } else if (HAPPA_PROXY_BASE_DOMAIN) {
      this.log(
        `HAPPA_PROXY_BASE_DOMAIN is ${HAPPA_PROXY_BASE_DOMAIN}. Just prefixing the service to the base domain`
      );
      this.proxies = this.proxies.map((p) => {
        p.URL = 'https://' + p.service + '.' + HAPPA_PROXY_BASE_DOMAIN;
        return p;
      });
    }

    this.apply = this.doApply;
  }

  init() {}

  log(message, service) {
    if (service) {
      console.log(chalk.green(`🏄  [Proxy Plugin: ${service}]`), message);
    } else {
      console.log(chalk.green(`🏄  [Proxy Plugin]`), message);
    }
  }

  /**
   * Start the proxy with configurable cors headers.
   * credit: https://github.com/garmeeh/local-cors-proxy/blob/master/lib/index.js
   * @arg {number} port - The port the local proxy will listen on.
   * @arg {string} proxyUrl - Where to proxy requests to.
   * @arg {string} credentials - The value that the proxy should use for the Access-Control-Allow-Credentials header.
   * @arg {string} origin - The value that the proxy should use for the Access-Control-Allow-Origin header.
   */
  startProxy(port, proxyUrl, credentials, origin, service) {
    let proxy = express();
    proxy.use(cors({ credentials: credentials, origin: origin }));
    proxy.options('*', cors({ credentials: credentials, origin: origin }));

    // remove trailing slash
    var cleanProxyUrl = proxyUrl.replace(/\/$/, '');

    let log = this.log.bind(this);

    proxy.use('/', function (req, res) {
      try {
        log('Request Proxied -> ' + req.url, service);
      } catch (e) {}

      req
        .pipe(
          request(cleanProxyUrl + req.url).on('response', (response) => {
            // In order to avoid https://github.com/expressjs/cors/issues/134
            const accessControlAllowOriginHeader =
              response.headers['access-control-allow-origin'];
            if (
              accessControlAllowOriginHeader &&
              accessControlAllowOriginHeader !== origin
            ) {
              response.headers['access-control-allow-origin'] = origin;
            }
          })
        )
        .pipe(res);
    });

    proxy.listen(port, 'localhost');
  }

  /**
    Webpack calls apply to apply the plugin into the chain. The constructor
    decides which function is actually used (noopApply or doApply)
  */
  noopApply() {
    // Do Nothing
  }

  /**
    This plugin is installed in the afterEnvironment hook.
    https://webpack.js.org/contribute/writing-a-plugin/
  */
  doApply(compiler) {
    compiler.hooks.afterEnvironment.tap(
      `Start cors proxy if a proxyURL is defined`,
      () => {
        this.proxies.forEach((p) => {
          this.log(
            `Starting CORS proxy on localhost:${p.localPort} to: ${p.URL}`,
            p.service
          );

          this.startProxy(p.localPort, p.URL, false, '*', p.service);

          this.log('Succesfully started CORS proxy', p.service);
        });
      }
    );
  }
}

module.exports = ProxyPlugin;
