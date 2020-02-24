import ControlPlaneGateway from 'model/gateways/ControlPlaneGateway';

class ConfigService {
  // eslint-disable-next-line class-methods-use-this
  setAuthToken(token) {
    ControlPlaneGateway.getInstance().setAuthorizationToken(token);
  }
}

export default ConfigService;
