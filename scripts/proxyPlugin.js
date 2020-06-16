const dotenv = require('dotenv');
const chalk = require('chalk');
const express = require('express');
const request = require('request');
const cors = require('cors');

/** A webpack plugin that starts a cors proxy if a certain environment variable is present */
class ProxyPlugin {
  /**
   * Starts a proxy to envVar at localPort if envVar is present.
   * @constructor
   * @arg {string} name - The name for this proxy (shows up in log lines, in case you want to run multiple proxies).
   * @arg {string} envVar - The environment variable that holds the proxy url. If this envVar is not set, the proxy will not start.
   * @arg {string} localPort - The port to listen for requests locally.
   */
  constructor(name, envVar, localPort) {
    this.name = name;
    this.envVar = envVar;
    this.localPort = localPort;
  }

  log(message) {
    console.log(chalk.green(`🏄  [Proxy Plugin: ${this.name}]`), message);
  }

  /**
   * Start the proxy with configurable cors headers.
   * credit: https://github.com/garmeeh/local-cors-proxy/blob/master/lib/index.js
   * @arg {number} port - The port the local proxy will listen on.
   * @arg {string} proxyUrl - Where to proxy requests to.
   * @arg {string} credentials - The value that the proxy should use for the Access-Control-Allow-Credentials header.
   * @arg {string} origin - The value that the proxy should use for the Access-Control-Allow-Origin header.
   */
  startProxy(port, proxyUrl, credentials, origin) {
    let proxy = express();
    proxy.use(cors({ credentials: credentials, origin: origin }));
    proxy.options('*', cors({ credentials: credentials, origin: origin }));

    // remove trailing slash
    var cleanProxyUrl = proxyUrl.replace(/\/$/, '');

    let log = this.log.bind(this);

    proxy.use('/', function (req, res) {
      try {
        log('Request Proxied -> ' + req.url);
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

    proxy.listen(port);
  }

  /**
    Webpack calls apply to apply the plugin into the chain.  This plugin is
    installed in the afterEnvironment hook.

    https://webpack.js.org/contribute/writing-a-plugin/
  */
  apply(compiler) {
    compiler.hooks.afterEnvironment.tap(
      `Start cors proxy if ${this.envVar} is defined`,
      () => {
        this.log(`Checking for ${this.envVar}`);

        const envFileVars = dotenv.config().parsed;

        const { [this.envVar]: PROXY_URL } = Object.assign(
          {},
          envFileVars,
          process.env
        );

        if (!PROXY_URL) {
          this.log(`Skipping. ${this.envVar} not defined.`);
          return;
        }

        this.log(`Starting CORS proxy on localhost:8000 to: ${PROXY_URL}`);

        this.startProxy(this.localPort, PROXY_URL, false, '*');

        this.log('Succesfully started CORS proxy');
      }
    );
  }
}

module.exports = ProxyPlugin;
