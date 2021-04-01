import add from 'date-fns/fp/add';
import { createMemoryHistory } from 'history';
import { compareDates } from 'lib/helpers';
import { AuthorizationTypes } from 'shared/constants';

import { IOAuth2EventCallbacks, IOAuth2Provider, OAuth2Events } from './OAuth2';
import { IOAuth2User } from './OAuth2User';

class TestOAuth2 implements IOAuth2Provider {
  constructor(
    private history = createMemoryHistory(),
    autoLogin: boolean = false
  ) {
    if (autoLogin) {
      this.loggedInUser = TestOAuth2.createLoggedInUser();
      this.renewUser();
    }
  }

  public async attemptLogin(): Promise<void> {
    this.history.push('/?code=some-code&state=some-state');

    return Promise.resolve();
  }

  public async handleLoginResponse(
    _fromURL: string
  ): Promise<IOAuth2User | null> {
    this.loggedInUser = TestOAuth2.createLoggedInUser();
    this.dispatchEvent(OAuth2Events.UserLoaded, this.loggedInUser);

    return Promise.resolve(this.loggedInUser);
  }

  public async getLoggedInUser(): Promise<IOAuth2User | null> {
    if (!this.loggedInUser) return null;

    // eslint-disable-next-line no-magic-numbers
    if (compareDates(this.loggedInUser.expiresAt * 1000, new Date()) <= 0) {
      await this.renewUser();
    }

    return this.loggedInUser;
  }

  public async renewUser(): Promise<IOAuth2User> {
    const now = new Date();
    const expirationDate = add({ days: 1 })(now);
    this.loggedInUser = TestOAuth2.createLoggedInUser(now, expirationDate);
    this.dispatchEvent(OAuth2Events.UserLoaded, this.loggedInUser);

    return Promise.resolve(this.loggedInUser);
  }

  public async logout(): Promise<void> {
    this.loggedInUser = null;
    this.dispatchEvent(OAuth2Events.UserSignedOut);

    return Promise.resolve();
  }

  public addEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, cb: U) {
    this.callbacks[event].push(cb);
  }

  public removeEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, fn: U) {
    this.callbacks[event].filter((cb) => !Object.is(cb, fn));
  }

  public expireUser() {
    if (!this.loggedInUser) return;

    const expiredDate = new Date(0);
    this.loggedInUser = TestOAuth2.createLoggedInUser(expiredDate, expiredDate);
    this.dispatchEvent(OAuth2Events.TokenExpired);
    this.dispatchEvent(OAuth2Events.UserLoaded, this.loggedInUser);
  }

  public dispatchEvent<T extends OAuth2Events, P>(event: T, payload?: P) {
    let dispatchedEvent: CustomEvent | null = null;
    if (payload) {
      dispatchedEvent = new CustomEvent(event, {
        detail: payload,
      });
    }

    for (const cb of this.callbacks[event]) {
      cb(dispatchedEvent!);
    }
  }

  public loggedInUser: IOAuth2User | null = null;

  public callbacks: Record<
    keyof IOAuth2EventCallbacks,
    IOAuth2EventCallbacks[keyof IOAuth2EventCallbacks][]
  > = {
    [OAuth2Events.UserLoaded]: [],
    [OAuth2Events.TokenExpired]: [],
    [OAuth2Events.TokenExpiring]: [],
    [OAuth2Events.UserUnloaded]: [],
    [OAuth2Events.UserSignedOut]: [],
    [OAuth2Events.SilentRenewError]: [],
  };

  public static createLoggedInUser(
    creationDate = new Date(),
    expirationDate = add({ days: 1 })(creationDate)
  ): IOAuth2User {
    // eslint-disable-next-line no-magic-numbers
    const nowDuration = Math.ceil(Number(creationDate) / 1000); // in seconds.

    // eslint-disable-next-line no-magic-numbers
    const expirationDuration = Math.ceil(Number(expirationDate) / 1000); // in seconds.

    const groups = ['some-group'];
    const email = 'developer@giantswarm.io';
    const emailVerified = true;

    const header = {
      alg: 'RS256',
      kid: 'some-random-key',
    };

    const tokenPayload = {
      iss: 'https://not-so-quick.com',
      sub: 'a-key',
      aud: ['cool'],
      exp: expirationDuration,
      iat: nowDuration,
      azp: 'some-other-key',
      at_hash: 'lolz',
      email,
      email_verified: emailVerified,
      groups,
      name: 'Developer McDeveloperson',
      preferred_username: 'mcDeveloperson',
    };

    const signature = 'haha-not-so-fast';

    const encode = (part: string | Record<string, unknown>) => {
      const asBase64 = window.btoa(JSON.stringify(part));

      return asBase64.replace(/-/g, '+').replace(/_/g, '/');
    };

    const idToken = `${encode(header)}.${encode(tokenPayload)}.${encode(
      signature
    )}`;

    return {
      refreshToken: 'some-random-key',
      idToken,
      groups,
      expiresAt: expirationDuration,
      authorizationType: AuthorizationTypes.BEARER,
      email,
      emailVerified,
    };
  }
}

export default TestOAuth2;
