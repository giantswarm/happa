import { HttpRequestMethods } from 'model/clients/HttpClient';

import ControlPlaneGateway from '.';
import { paths } from './paths';

export function getInfo() {
  const client = ControlPlaneGateway.getInstance().getClient();
  client.setRequestMethod(HttpRequestMethods.GET);
  client.setURL(paths.Info);

  return client.execute();
}
