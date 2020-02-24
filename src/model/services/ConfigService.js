import ControlPlaneGateway from 'model/gateways/ControlPlaneGateway';

class ConfigService {
  // eslint-disable-next-line class-methods-use-this
  setAuthToken(token) {
    ControlPlaneGateway.getInstance().setAuthToken(token);
  }

  // eslint-disable-next-line class-methods-use-this
  setAuthTokenRenewCallback(callback) {
    ControlPlaneGateway.getInstance().onAuthRenew = callback;
  }
}

export default ConfigService;
