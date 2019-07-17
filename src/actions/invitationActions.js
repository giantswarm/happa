import * as types from './actionTypes';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import _ from 'underscore';
import Passage from 'lib/passage_client';

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
        console.error('Error when loading invitation:', error);

        new FlashMessage(
          'Something went wrong while trying to load invitations',
          messageType.ERROR,
          messageTTL.MEDIUM,
          'Please try again later or contact support: support@giantswarm.io'
        );

        dispatch({
          type: types.INVITATIONS_LOAD_ERROR,
        });

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

        // We show no flash message here,
        // as the success is reported directly in the
        // modal dialog that's kept open.

        dispatch(invitationsLoad());

        return result;
      })
      .catch(error => {
        console.error('Error inviting user:', error);

        new FlashMessage(
          'Something went wrong while trying to create your invitation.',
          messageType.ERROR,
          messageTTL.LONG,
          'Please try again later or contact support: support@giantswarm.io'
        );

        dispatch({
          type: types.INVITATION_CREATE_ERROR,
        });

        throw error;
      });
  };
}
