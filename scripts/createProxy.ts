import express from 'express';
import cors from 'cors';
import request from 'request';

/**
 * Create a local server that will proxy requests to a specific host.
 * */
export function createProxy(
  host: string,
  localPort: number,
  onProxy?: (req: express.Request) => void
) {
  const proxy = express();

  proxy.use(
    cors({
      credentials: false,
      origin: '*',
      exposedHeaders: 'Location',
      maxAge: 86400,
    })
  );

  proxy.options(
    '*',
    // @ts-expect-error
    cors({
      credentials: false,
      origin: '*',
      exposedHeaders: 'Location',
      maxAge: 86400,
    })
  );

  proxy.use('/', (req, res) => {
    onProxy?.(req);

    const requestURL = `${host.replace(/\/$/, '')}${req.url}`;

    req.pipe(handleProxyRequest(requestURL)).pipe(res);
  });

  proxy.listen(localPort, 'localhost');
}

function handleProxyRequest(requestURL: string) {
  return request({
    url: requestURL,
    rejectUnauthorized: false,
    followAllRedirects: false,
    followRedirect: false,
    followOriginalHttpMethod: true,
  }).on('response', handleProxyResponse);
}

function handleProxyResponse(response: request.Response) {
  const accessControlAllowOriginHeader =
    response.headers['access-control-allow-origin'];

  if (
    accessControlAllowOriginHeader &&
    accessControlAllowOriginHeader !== '*'
  ) {
    response.headers['access-control-allow-origin'] = '*';
  }
}
