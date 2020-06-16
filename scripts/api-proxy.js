// credit: https://github.com/garmeeh/local-cors-proxy/blob/master/lib/index.js

const express = require('express');
const request = require('request');
const cors = require('cors');
const chalk = require('chalk');
const proxy = express();

var startProxy = function (port, proxyUrl, proxyPartial, credentials, origin) {
  proxy.use(cors({ credentials: credentials, origin: origin }));
  proxy.options('*', cors({ credentials: credentials, origin: origin }));

  // remove trailing slash
  var cleanProxyUrl = proxyUrl.replace(/\/$/, '');
  // remove all forward slashes
  var cleanProxyPartial = proxyPartial.replace(/\//g, '');

  proxy.use('/' + cleanProxyPartial, function (req, res) {
    try {
      console.log(chalk.green('Request Proxied -> ' + req.url));
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
            console.log(
              chalk.blue(
                'Override access-control-allow-origin header from proxified URL : ' +
                  chalk.green(accessControlAllowOriginHeader) +
                  '\n'
              )
            );
            response.headers['access-control-allow-origin'] = origin;
          }
        })
      )
      .pipe(res);
  });

  proxy.listen(port);
};

exports.startProxy = startProxy;
