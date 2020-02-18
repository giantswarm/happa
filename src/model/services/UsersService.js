import { getUserData } from 'model/gateways/ControlPlaneGateway';

class UsersService {
  otherService = null;

  constructor(otherService) {
    this.otherService = otherService;
  }

  // eslint-disable-next-line class-methods-use-this
  async getUser() {
    const userData = await getUserData();
    this.otherService.getSomething();

    return userData;
  }
}

export default UsersService;
