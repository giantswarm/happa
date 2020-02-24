import { getInfo } from 'model/gateways/ControlPlaneGateway';

class InfoService {
  // eslint-disable-next-line class-methods-use-this
  async getInfo() {
    const userData = await getInfo();

    return userData;
  }
}

export default InfoService;
