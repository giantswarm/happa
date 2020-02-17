import ControlPlaneGateway from '.';

export function getUserData() {
  const client = ControlPlaneGateway.getInstance().getClient();

  return client.get('/v4/user/');
}
