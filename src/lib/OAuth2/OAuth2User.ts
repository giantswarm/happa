import { User } from 'oidc-client';

export interface IOAuth2User {
  idToken: string;
  accessToken: string;
  expiresAt: number;

  groups: string[];
  email: string;
  emailVerified: boolean;
}

class OAuth2UserImpl implements IOAuth2User {
  public readonly idToken: string = '';
  public readonly accessToken: string = '';
  public readonly expiresAt: number = 0;

  public readonly groups: string[] = [];
  public readonly email: string = '';
  public readonly emailVerified: boolean = false;

  public static fromOIDCUser(user: User): OAuth2UserImpl {
    const newUser = new OAuth2UserImpl({
      idToken: user.id_token,
      accessToken: user.access_token,
      expiresAt: user.expires_at,
      groups: user.profile.groups || [],
      email: user.profile.email,
      emailVerified: user.profile.email_verified,
    });

    return newUser;
  }

  constructor(fromObj?: Partial<IOAuth2User>) {
    if (!fromObj) return;

    for (const [key, value] of Object.entries(fromObj)) {
      // @ts-ignore
      this[key] = value;
    }
  }

  public isExpired(): boolean {
    const sInMs = 1000;
    const now = Math.trunc(Date.now() / sInMs); // In seconds.
    const expiresIn = this.expiresAt - now;

    return expiresIn <= 0;
  }

  public serialize(): IOAuth2User {
    return {
      idToken: this.idToken,
      accessToken: this.accessToken,
      expiresAt: this.expiresAt,

      groups: this.groups,
      email: this.email,
      emailVerified: this.emailVerified,
    };
  }
}

export default OAuth2UserImpl;
