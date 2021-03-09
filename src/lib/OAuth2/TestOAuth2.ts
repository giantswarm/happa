import add from 'date-fns/fp/add';
import { createMemoryHistory } from 'history';
import { compareDates } from 'lib/helpers';
import { AuthorizationTypes } from 'shared/constants';

import { IOAuth2EventCallbacks, IOAuth2Provider, OAuth2Events } from './OAuth2';
import { IOAuth2User } from './OAuth2User';

class TestOAuth2 implements IOAuth2Provider {
  // eslint-disable-next-line no-useless-constructor
  constructor(private history = createMemoryHistory()) {}

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

    if (compareDates(this.loggedInUser.expiresAt, new Date()) >= 0) {
      await this.renewUser();
    }

    return this.loggedInUser;
  }

  public async renewUser(): Promise<IOAuth2User> {
    const expirationDate = add({ days: 1 })(new Date()).getSeconds();

    this.loggedInUser!.expiresAt = expirationDate;
    this.dispatchEvent(OAuth2Events.UserLoaded, this.loggedInUser);

    return Promise.resolve(this.loggedInUser!);
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

  private dispatchEvent<T extends OAuth2Events, P>(event: T, payload?: P) {
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

  private loggedInUser: IOAuth2User | null = null;

  private callbacks: Record<
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

  private static createLoggedInUser(): IOAuth2User {
    const now = new Date();
    const expiration = add({ days: 1 })(now);

    // eslint-disable-next-line no-magic-numbers
    const nowDuration = Number(now) / 1000; // in seconds.
    // eslint-disable-next-line no-magic-numbers
    const expirationDuration = Number(expiration) / 1000; // in seconds.

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
