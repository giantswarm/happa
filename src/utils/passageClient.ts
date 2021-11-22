import { HttpClientImpl } from 'model/clients/HttpClient';

import * as helpers from './helpers';

export interface IPassageConfig {
  endpoint: string;
  timeout_ms?: number;
}

export interface IPassageCheckInviteResponse {
  is_valid: boolean;
  email: string;
  invite_date: string;
}

export interface IPassageCreateAccountResponse {
  username: string;
  email: string;
  token: string;
}

export interface IRequestPasswordRecoveryTokenResponse {
  message: string;
  email: string;
  valid_until: string;
}

export interface IVerifyPasswordRecoveryTokenResponse {
  token: string;
  email: string;
  is_valid: boolean;
}

export interface ISetNewPasswordResponse {
  message: string;
  email: string;
  username: string;
  token: string;
}

export interface IPassageInvitation {
  created: string;
  email: string;
  expiry: string;
  invited_by: string;
  organizations: string;
  status: string;
}

export interface IPassageCreateInvitationResponse extends IPassageInvitation {
  invitation_accept_link: string;
  invitation_accept_token: string;
  invitation_token_hash: string;
}

/**
 * A client for `Passage`.
 */
class Passage {
  constructor(config: IPassageConfig) {
    this.config = config;

    const constraints = {
      endpoint: {
        presence: true,
        url: {
          allowLocal: true,
        },
      },
    };

    helpers.validateOrRaise(this.config, constraints);

    if (typeof this.config.timeout_ms === 'undefined') {
      this.config.timeout_ms = 10000;
    }
  }

  /**
   * Check if a invitation token is valid.
   * @param params
   */
  public async checkInvite(params: { token: string }) {
    const constraints = {
      token: { presence: true },
    };
    try {
      helpers.validateOrRaise(params, constraints);
    } catch {
      return Promise.reject(new Error('InvalidToken'));
    }

    const url = `${this.config.endpoint}/invite/${params.token}`;
    const res = await HttpClientImpl.get<IPassageCheckInviteResponse>(url, {
      timeout: this.config.timeout_ms,
    });
    if (!res.data.is_valid) {
      return Promise.reject(new Error('InvalidToken'));
    }

    return res.data;
  }

  public async createAccount(params: {
    inviteToken: string;
    password: string;
  }) {
    const constraints = {
      inviteToken: { presence: true },
      password: { presence: true },
    };
    helpers.validateOrRaise(params, constraints);

    const url = `${this.config.endpoint}/accounts/`;
    const res = await HttpClientImpl.post<IPassageCreateAccountResponse>(url, {
      timeout: this.config.timeout_ms,
      data: {
        invite_token: params.inviteToken,
        password: params.password,
      },
    });

    return res.data;
  }

  /**
   * Request a password recovery token, which passage will send to the user's email.
   * @param params
   */
  public async requestPasswordRecoveryToken(params: { email: string }) {
    const constraints = {
      email: { presence: true, email: true },
    };
    helpers.validateOrRaise(params, constraints);

    const url = `${this.config.endpoint}/recovery/`;
    const res =
      await HttpClientImpl.post<IRequestPasswordRecoveryTokenResponse>(url, {
        timeout: this.config.timeout_ms,
        data: {
          email: params.email,
        },
      });

    return res.data;
  }

  /**
   * Verify a password recovery token. Promise only resolves if the token is valid.
   * If the token is invalid, or the request fails for some reason the promise is
   * rejected.
   * @param params
   */
  public async verifyPasswordRecoveryToken(params: {
    email: string;
    token: string;
  }) {
    const constraints = {
      email: { presence: true, email: true },
      token: { presence: true },
    };
    try {
      helpers.validateOrRaise(params, constraints);
    } catch {
      return Promise.reject(new Error('InvalidToken'));
    }

    const url = `${this.config.endpoint}/recovery/${params.token}/`;
    const res = await HttpClientImpl.post<IVerifyPasswordRecoveryTokenResponse>(
      url,
      {
        timeout: this.config.timeout_ms,
        data: {
          email: params.email,
        },
      }
    );
    if (!res.data.is_valid) {
      throw new Error('InvalidToken');
    }

    return res.data;
  }

  /**
   * Set a new password. Requires a valid recovery token.
   * If the token is invalid, or the request fails for some reason the promise is
   * rejected.
   * @param params
   */
  public async setNewPassword(params: {
    email: string;
    token: string;
    password: string;
  }) {
    const constraints = {
      email: { presence: true, email: true },
      token: { presence: true },
      password: { presence: true },
    };
    helpers.validateOrRaise(params, constraints);

    const url = `${this.config.endpoint}/recovery/${params.token}/password/`;
    const res = await HttpClientImpl.post<ISetNewPasswordResponse>(url, {
      timeout: this.config.timeout_ms,
      data: {
        email: params.email,
        password: params.password,
      },
    });

    return res.data;
  }

  /**
   * Gets all the invitations on a given installation.
   * Requires a valid admin JWT token.
   * @param authToken
   */
  public async getInvitations(authToken: string) {
    const url = `${this.config.endpoint}/invites/`;
    const res = await HttpClientImpl.get<IPassageInvitation[]>(url, {
      timeout: this.config.timeout_ms,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
      },
    });

    return res.data;
  }

  /**
   * Creates an invitation. Even though passage can take multiple organizations
   * this function is only set up to receive one.
   * Requires a valid admin JWT token.
   * @param authToken
   * @param invitation
   */
  public async createInvitation(
    authToken: string,
    invitation: {
      email: string;
      organizations: string;
      sendEmail: boolean;
    }
  ) {
    const constraints = {
      email: { presence: true, email: true },
      organizations: { presence: { allowEmpty: false } },
      sendEmail: { presence: true },
    };
    helpers.validateOrRaise(invitation, constraints);

    const url = `${this.config.endpoint}/invite/`;
    const res = await HttpClientImpl.post<IPassageCreateInvitationResponse>(
      url,
      {
        timeout: this.config.timeout_ms,
        data: {
          email: invitation.email,
          organizations: invitation.organizations,
          send_email: invitation.sendEmail,
        },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      }
    );

    return res.data;
  }

  protected config: IPassageConfig;
}

export default Passage;
