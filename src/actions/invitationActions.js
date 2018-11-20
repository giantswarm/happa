'use strict';

import { flashAdd } from './flashMessageActions';
import React from 'react';
import * as types from './actionTypes';
import Passage from '../lib/passage_client';
import _ from 'underscore';

// invitationsLoad
// -----------------
// Loads all invitations from Passage into state.
// /invites/

export function invitationsLoad() {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;

    var passage = new Passage({ endpoint: window.config.passageEndpoint });

    var alreadyFetching = getState().entities.invitations.isFetching;

    if (alreadyFetching) {
      return new Promise(resolve => {
        resolve();
      });
    }

    dispatch({ type: types.INVITATIONS_LOAD });

    return passage
      .getInvitations(token)
      .then(invitesArray => {
        var invites = {};

        _.each(invitesArray, invite => {
          invite.emaildomain = invite.email.split('@')[1];
          invites[invite.email] = invite;
        });

        dispatch({
          type: types.INVITATIONS_LOAD_SUCCESS,
          invites,
        });
      })
      .catch(error => {
        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Something went wrong while trying to load invitations
                </strong>
                <br />
                {error.body
                  ? error.body.message
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.INVITATIONS_LOAD_ERROR,
        });

        console.error(error);
        throw error;
      });
  };
}

// invitationCreate
// -----------------
// Create a invitation
// POST /invite/ to Passage.

export function invitationCreate(invitation) {
  return function(dispatch, getState) {
    var token = getState().app.loggedInUser.auth.token;

    var passage = new Passage({ endpoint: window.config.passageEndpoint });

    dispatch({ type: types.INVITATION_CREATE });

    return passage
      .createInvitation(token, invitation)
      .then(result => {
        dispatch({
          type: types.INVITATION_CREATE_SUCCESS,
        });

        dispatch(
          flashAdd({
            message: 'Successfully invited ' + result.email,
            class: 'success',
            ttl: 3000,
          })
        );

        dispatch(invitationsLoad());

        return result;
      })
      .catch(error => {
        dispatch(
          flashAdd({
            message: (
              <div>
                <strong>
                  Something went wrong while trying to create your invitation.
                </strong>
                <br />
                {error.body
                  ? error.body.message
                  : 'Perhaps our servers are down, please try again later or contact support: support@giantswarm.io'}
              </div>
            ),
            class: 'danger',
          })
        );

        dispatch({
          type: types.INVITATION_CREATE_ERROR,
        });

        console.error(error);
        throw error;
      });
  };
}
