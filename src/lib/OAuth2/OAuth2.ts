import OAuth2UserImpl from 'lib/OAuth2/OAuth2User';
import { User, UserManager, UserManagerSettings } from 'oidc-client';

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
}

class OAuth2 {
  protected userManager: UserManager;
  protected eventEmitter: EventTarget;

  constructor(config: IOAuth2Config) {
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
      includeIdTokenInSilentRenew: true,
      loadUserInfo: true,
      revokeAccessTokenOnSignout: true,
      filterProtocolClaims: true,
      validateSubOnSilentRenew: true,
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
    try {
      const origUser = await this.userManager.signinRedirectCallback(
        currentURL
      );
      const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

      return newUser;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async getLoggedInUser(): Promise<OAuth2UserImpl | null> {
    try {
      const origUser = await this.userManager.getUser();
      if (!origUser) return null;

      this.userManager.events.load(origUser);
      const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

      return newUser;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async renewUser(): Promise<OAuth2UserImpl> {
    try {
      const origUser = await this.userManager.signinSilent();

      this.userManager.events.load(origUser);
      const newUser = OAuth2UserImpl.fromOIDCUser(origUser);

      return newUser;
    } catch (err) {
      return Promise.reject(err);
    }
  }

  public async logout(): Promise<void> {
    this.userManager.events.unload();
    await this.userManager.removeUser();
    await this.userManager.clearStaleState();
  }

  public addEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, cb: U) {
    this.eventEmitter.addEventListener(
      event,
      (cb as unknown) as EventListener,
      false
    );
  }

  public removeEventListener<
    T extends OAuth2Events,
    U extends IOAuth2EventCallbacks[T]
  >(event: T, fn: U) {
    this.eventEmitter.removeEventListener(
      event,
      (fn as unknown) as EventListener,
      false
    );
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
