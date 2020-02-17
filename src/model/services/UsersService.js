import { getUserData } from 'model/gateways/ControlPlaneGateway';
import LocalStorage from 'model/storage/LocalStorage';

class UsersService {
  // otherService = null;

  // constructor(otherService) {
  //   this.otherService = otherService;
  // }

  // eslint-disable-next-line class-methods-use-this
  async getUser() {
    const userData = await getUserData();
    LocalStorage.getInstance().setValue('user', userData);

    return userData;
  }
}

export default UsersService;
