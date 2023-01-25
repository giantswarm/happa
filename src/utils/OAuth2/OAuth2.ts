/* istanbul ignore file */

import {
  User,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client-ts';
import {
  convertToOIDCMetadata,
  IOAuth2CustomMetadata,
} from 'utils/OAuth2/OAuth2CustomMetadata';

import { getUserFromOIDCUser, IOAuth2User } from './OAuth2User';

export enum OAuth2Events {
  UserLoaded = 'userLoaded',
  TokenExpired = 'tokenExpired',
  TokenExpiring = 'tokenExpiring',
  UserUnloaded = 'userUnloaded',
  UserSignedOut = 'userSignedOut',
  SilentRenewError = 'silentRenewError',
}

export interface IOAuth2EventCallbacks {
  [OAuth2Events.UserLoaded]: (event: CustomEvent<IOAuth2User>) => void;
  [OAuth2Events.TokenExpired]: () => void;
  [OAuth2Events.TokenExpiring]: () => void;
  [OAuth2Events.UserUnloaded]: () => void;
  [OAuth2Events.UserSignedOut]: () => void;
  [OAuth2Events.SilentRenewError]: (error: CustomEvent<Error>) => void;
}

export interface IOAuth2SigningKey {
  use: string;
  kty: string;
  kid: string;
  alg: string;
  n: string;
  e: string;
}

export interface IOAuth2ImpersonationMetadata {
  user: string;
  groups?: string[];
}

export interface IOAuth2Provider {
  attemptLogin: () => Promise<void>;
  handleLoginResponse: (fromURL: string) => Promise<IOAuth2User | null>;
  getLoggedInUser: () => Promise<IOAuth2User | null>;
  renewUser: () => Promise<IOAuth2User | null>;
  logout: () => Promise<void>;
  getImpersonationMetadata: () => Promise<IOAuth2ImpersonationMetadata | null>;
  setImpersonationMetadata: (
    metadata: IOAuth2ImpersonationMetadata | null
  ) => Promise<void>;

  addEventListener: <
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(
    event: T,
    cb: U
  ) => void;
  removeEventListener: <
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(
    event: T,
    fn: U
  ) => void;
}

export interface IOAuth2Config {
  authority: string;
  clientId: string;
  redirectUri: string;
  responseType?: string;
  responseMode?: 'query' | 'fragment';
  clientSecret?: string;
  scope?: string;
  prompt?: string;
  automaticSilentRenew?: boolean;
  includeIDTokenInSilentRenew?: boolean;
  loadUserInfo?: boolean;
  revokeTokensOnSignout?: boolean;
  filterProtocolClaims?: boolean;
  validateSubOnSilentRenew?: boolean;
  persistenceMethod?: Storage;
  customMetadata?: Partial<IOAuth2CustomMetadata>;
  signingKeys?: IOAuth2SigningKey[];
}

class OAuth2 implements IOAuth2Provider {
  protected userManager: UserManager;
  protected eventEmitter: EventTarget;
  protected persistenceMethod: WebStorageStateStore;
  protected authority: string;

  constructor(config: IOAuth2Config) {
    this.persistenceMethod = new WebStorageStateStore({
      store: config.persistenceMethod,
    });
    this.authority = config.authority;

    const customMetadata = convertToOIDCMetadata(config.customMetadata);

    const managerConfig: UserManagerSettings = {
      authority: config.authority,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      response_type: config.responseType,
      response_mode: config.responseMode,
      scope: config.scope,
      prompt: config.prompt,
      automaticSilentRenew: config.automaticSilentRenew,
      includeIdTokenInSilentRenew: config.includeIDTokenInSilentRenew,
      loadUserInfo: config.loadUserInfo,
      revokeTokensOnSignout: config.revokeTokensOnSignout,
      filterProtocolClaims: config.filterProtocolClaims,
      validateSubOnSilentRenew: config.validateSubOnSilentRenew,
      userStore: this.persistenceMethod,
      metadata: customMetadata,
    };

    this.eventEmitter = new EventTarget();
    this.userManager = new UserManager(managerConfig);

    this.registerInternalEvents();
  }

  public attemptLogin(): Promise<void> {
    return this.userManager.signinRedirect({ redirectMethod: 'replace' });
  }

  public async handleLoginResponse(currentURL: string): Promise<IOAuth2User> {
    const origUser = await this.userManager.signinRedirectCallback(currentURL);

    return getUserFromOIDCUser(origUser);
  }

  public async getLoggedInUser(): Promise<IOAuth2User | null> {
    let origUser = await this.userManager.getUser();
    if (!origUser) return null;

    // If user is already expired, renew their authentication.
    if (origUser.expired) {
      origUser = await this.userManager.signinSilent();
      if (!origUser) return null;

      this.userManager.events.load(origUser);
    }

    return getUserFromOIDCUser(origUser);
  }

  public async renewUser(): Promise<IOAuth2User | null> {
    const origUser = await this.userManager.signinSilent();

    if (!origUser) return null;

    const newUser = getUserFromOIDCUser(origUser);

    this.userManager.events.load(origUser);

    return newUser;
  }

  public async logout(): Promise<void> {
    await this.userManager.removeUser();
    await this.userManager.clearStaleState();
  }

  public async getImpersonationMetadata(): Promise<IOAuth2ImpersonationMetadata | null> {
    const key = this.getImpersonationStorageKey();
    const value: string | null = await this.persistenceMethod.get(key);
    if (!value) return null;

    return JSON.parse(value);
  }

  public async setImpersonationMetadata(
    metadata: IOAuth2ImpersonationMetadata | null
  ): Promise<void> {
    const key = this.getImpersonationStorageKey();
    if (!metadata) {
      await this.persistenceMethod.remove(key);

      return;
    }

    const value = JSON.stringify(metadata);

    await this.persistenceMethod.set(key, value);
  }

  public addEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, cb: U) {
    this.eventEmitter.addEventListener(event, cb as EventListener, false);
  }

  public removeEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, fn: U) {
    this.eventEmitter.removeEventListener(event, fn as EventListener, false);
  }

  protected unregisterInternalEvents() {
    this.userManager.events.removeUserLoaded(this.onUserLoaded);
    this.userManager.events.removeAccessTokenExpired(this.onAccessTokenExpired);
    this.userManager.events.removeAccessTokenExpiring(
      this.onAccessTokenExpiring
    );
    this.userManager.events.removeUserUnloaded(this.onUserUnloaded);
    this.userManager.events.removeUserSignedOut(this.onUserSignedOut);
    this.userManager.events.removeSilentRenewError(this.onSilentRenewError);
  }

  protected registerInternalEvents() {
    this.userManager.events.addUserLoaded(this.onUserLoaded);
    this.userManager.events.addAccessTokenExpired(this.onAccessTokenExpired);
    this.userManager.events.addAccessTokenExpiring(this.onAccessTokenExpiring);
    this.userManager.events.addUserUnloaded(this.onUserUnloaded);
    this.userManager.events.addUserSignedOut(this.onUserSignedOut);
    this.userManager.events.addSilentRenewError(this.onSilentRenewError);
  }

  protected onUserLoaded = (user: User) => {
    const newUser = getUserFromOIDCUser(user);
    const event = new CustomEvent(OAuth2Events.UserLoaded, {
      detail: newUser,
    });
    this.eventEmitter.dispatchEvent(event);
  };

  protected onAccessTokenExpired = () => {
    const event = new CustomEvent(OAuth2Events.TokenExpired);
    this.eventEmitter.dispatchEvent(event);
  };

  protected onAccessTokenExpiring = async () => {
    await this.renewUser();
  };

  protected onUserUnloaded = () => {
    const event = new CustomEvent(OAuth2Events.UserUnloaded);
    this.eventEmitter.dispatchEvent(event);
  };

  protected onUserSignedOut = () => {
    const event = new CustomEvent(OAuth2Events.UserSignedOut);
    this.eventEmitter.dispatchEvent(event);
  };

  protected onSilentRenewError = (error: Error) => {
    const event = new CustomEvent(OAuth2Events.SilentRenewError, {
      detail: error,
    });
    this.eventEmitter.dispatchEvent(event);
  };

  protected getImpersonationStorageKey(): string {
    return `impersonation:${this.authority}`;
  }
}

export default OAuth2;
