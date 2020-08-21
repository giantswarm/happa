import {
  convertToOIDCMetadata,
  IOAuth2CustomMetadata,
} from 'lib/OAuth2/OAuth2CustomMetadata';
import OAuth2UserImpl from 'lib/OAuth2/OAuth2User';
import {
  User,
  UserManager,
  UserManagerSettings,
  WebStorageStateStore,
} from 'oidc-client';

export enum OAuth2Events {
  UserLoaded = 'userLoaded',
  TokenExpired = 'tokenExpired',
  TokenExpiring = 'tokenExpiring',
  UserUnloaded = 'userUnloaded',
  UserSignedOut = 'userSignedOut',
  SilentRenewError = 'silentRenewError',
}

interface IOAuth2EventCallbacks {
  [OAuth2Events.UserLoaded]: (event: CustomEvent<OAuth2UserImpl>) => void;
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

export interface IOAuth2Config {
  authority: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  responseType?: string;
  responseMode?: 'query' | 'fragment';
  scope?: string;
  prompt?: string;
  automaticSilentRenew?: boolean;
  includeIDTokenInSilentRenew?: boolean;
  loadUserInfo?: boolean;
  revokeAccessTokenOnLogout?: boolean;
  filterProtocolClaims?: boolean;
  validateSubOnSilentRenew?: boolean;
  persistenceMethod?: Storage;
  customMetadata?: Partial<IOAuth2CustomMetadata>;
  signingKeys?: IOAuth2SigningKey[];
}

class OAuth2 {
  protected userManager: UserManager;
  protected eventEmitter: EventTarget;

  constructor(config: IOAuth2Config) {
    const persistenceMethod = new WebStorageStateStore({
      store: config.persistenceMethod,
    });

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
      revokeAccessTokenOnSignout: config.revokeAccessTokenOnLogout,
      filterProtocolClaims: config.filterProtocolClaims,
      validateSubOnSilentRenew: config.validateSubOnSilentRenew,
      userStore: persistenceMethod,
      signingKeys: config.signingKeys,
      metadata: customMetadata,
    };

    this.eventEmitter = new EventTarget();
    this.userManager = new UserManager(managerConfig);

    this.registerInternalEvents();
  }

  public attemptLogin(): Promise<void> {
    return this.userManager.signinRedirect({ useReplaceToNavigate: true });
  }

  public async handleLoginResponse(
    currentURL: string
  ): Promise<OAuth2UserImpl> {
    const origUser = await this.userManager.signinRedirectCallback(currentURL);
    const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

    return newUser;
  }

  public async getLoggedInUser(): Promise<OAuth2UserImpl | null> {
    let origUser = await this.userManager.getUser();
    if (!origUser) return null;

    // If user is already expired, renew his authentication.
    if (origUser.expired) {
      origUser = await this.userManager.signinSilent();
    }

    this.userManager.events.load(origUser);
    const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

    return newUser;
  }

  public async renewUser(): Promise<OAuth2UserImpl> {
    const origUser = await this.userManager.signinSilent();

    this.userManager.events.load(origUser);
    const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

    return newUser;
  }

  public async logout(): Promise<void> {
    await this.userManager.removeUser();
    await this.userManager.clearStaleState();
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

  public unregisterInternalEvents() {
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
    const newUser = OAuth2UserImpl.fromOIDCUser(user);
    const event = new CustomEvent(OAuth2Events.UserLoaded, {
      detail: newUser,
    });
    this.eventEmitter.dispatchEvent(event);
  };

  protected onAccessTokenExpired = () => {
    const event = new CustomEvent(OAuth2Events.TokenExpired);
    this.eventEmitter.dispatchEvent(event);
  };

  protected onAccessTokenExpiring = () => {
    const event = new CustomEvent(OAuth2Events.TokenExpiring);
    this.eventEmitter.dispatchEvent(event);
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
    const event = new CustomEvent(OAuth2Events.UserLoaded, {
      detail: error,
    });
    this.eventEmitter.dispatchEvent(event);
  };
}

export default OAuth2;
