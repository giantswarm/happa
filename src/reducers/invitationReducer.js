import * as types from '../actions/actionTypes';

export default function invitationReducer(
  state = { lastUpdated: 0, isFetching: false, items: {} },
  action = undefined
) {
  switch (action.type) {
    case types.INVITATIONS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: state.items,
      };

    case types.INVITATIONS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.invites,
      };

    case types.INVITATIONS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items,
      };

    default:
      return state;
  }
}
