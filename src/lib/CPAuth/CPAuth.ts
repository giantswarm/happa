import { defaultConfig } from 'lib/CPAuth/config';
import OAuth2 from 'lib/OAuth2/OAuth2';

class CPAuth extends OAuth2 {
  private static _instance: CPAuth | null = null;

  static getInstance(): CPAuth {
    if (!CPAuth._instance) {
      CPAuth._instance = new CPAuth(defaultConfig);
    }

    return CPAuth._instance;
  }
}

export default CPAuth;
