import * as request from 'superagent-bluebird-promise';

import * as helpers from './helpers';

export interface IPassageConfig {
  endpoint: string;
  timeout_ms?: number;
}

export interface IPassageInvitation {
  email: string;
  organizations: string;
  sendEmail: boolean;
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
  public checkInvite(params: { token: string }) {
    const constraints = {
      token: { presence: true },
    };

    const url = `${this.config.endpoint}/invite/${params.token}`;

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(params, constraints);
      resolve(request.get(url).timeout(this.config.timeout_ms));
    }).then((x) => {
      if (x.body.is_valid) {
        return x.body;
      }
      throw Error('InvalidToken');
    });

    return promise;
  }

  public createAccount(params: { inviteToken: string; password: string }) {
    const constraints = {
      inviteToken: { presence: true },
      password: { presence: true },
    };

    const url = `${this.config.endpoint}/accounts/`;

    // Passage is not expecting camelcase properties in its request body.
    const payload = {
      invite_token: params.inviteToken,
      password: params.password,
    };

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(params, constraints);
      resolve(
        request
          .post(url)
          .timeout(this.config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json')
      );
    }).then((x) => {
      return x.body;
    });

    return promise;
  }

  /**
   * Request a password recovery token, which passage will send to the user's email.
   * @param params
   */
  public requestPasswordRecoveryToken(params: { email: string }) {
    const constraints = {
      email: { presence: true, email: true },
    };

    const url = `${this.config.endpoint}/recovery/`;

    const payload = {
      email: params.email,
    };

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(params, constraints);
      resolve(
        request
          .post(url)
          .timeout(this.config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json')
      );
    }).then((x) => {
      return x.body;
    });

    return promise;
  }

  /**
   * Verify a password recovery token. Promise only resolves if the token is valid.
   * If the token is invalid, or the request fails for some reason the promise is
   * rejected.
   * @param params
   */
  public verifyPasswordRecoveryToken(params: { email: string; token: string }) {
    const constraints = {
      email: { presence: true, email: true },
      token: { presence: true },
    };

    const url = `${this.config.endpoint}/recovery/${params.token}/`;

    const payload = {
      email: params.email,
    };

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(params, constraints);
      resolve(
        request
          .post(url)
          .timeout(this.config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json')
      );
    }).then((x) => {
      if (x.body.is_valid) {
        return x.body;
      }
      throw new Error('Invalid Token');
    });

    return promise;
  }

  /**
   * Set a new password. Requires a valid recovery token.
   * If the token is invalid, or the request fails for some reason the promise is
   * rejected.
   * @param params
   */
  public setNewPassword(params: {
    email: string;
    token: string;
    password: string;
  }) {
    const constraints = {
      email: { presence: true, email: true },
      token: { presence: true },
      password: { presence: true },
    };

    const url = `${this.config.endpoint}/recovery/${params.token}/password/`;

    const payload = {
      email: params.email,
      password: params.password,
    };

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(params, constraints);
      resolve(
        request
          .post(url)
          .timeout(this.config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json')
      );
    }).then((x) => {
      return x.body;
    });

    return promise;
  }

  /**
   * Gets all the invitations on a given installation.
   * Requires a valid admin JWT token.
   * @param authToken
   */
  public getInvitations(authToken: string) {
    const url = `${this.config.endpoint}/invites/`;

    const promise = new Promise((resolve) => {
      resolve(
        request
          .get(url)
          .timeout(this.config.timeout_ms)
          .set('ContentType', 'application/json')
          .set('Authorization', `Bearer ${authToken}`)
      );
    }).then((x) => {
      return x.body;
    });

    return promise;
  }

  /**
   * Creates an invitation. Even though passage can take multiple organizations
   * this function is only set up to receive one.
   * Requires a valid admin JWT token.
   * @param authToken
   * @param invitation
   */
  public createInvitation(authToken: string, invitation: IPassageInvitation) {
    const url = `${this.config.endpoint}/invite/`;

    const constraints = {
      email: { presence: true, email: true },
      organizations: { presence: { allowEmpty: false } },
      sendEmail: { presence: true },
    };

    const payload = {
      email: invitation.email,
      organizations: invitation.organizations,
      send_email: invitation.sendEmail,
    };

    const promise = new Promise((resolve) => {
      helpers.validateOrRaise(invitation, constraints);
      resolve(
        request
          .post(url)
          .timeout(this.config.timeout_ms)
          .send(payload)
          .set('ContentType', 'application/json')
          .set('Authorization', `Bearer ${authToken}`)
      );
    }).then((x) => {
      return x.body;
    });

    return promise;
  }

  protected config: IPassageConfig;
}

export default Passage;
