import * as types from 'actions/actionTypes';

/**
 * organizationReducer manipulates the appplication state based on organization actions.
 *
 * 'items' here ends up in the state's entities.organizations attribute.
 *
 * @param {*} state
 * @param {*} action
 */
export default function organizationReducer(
  state = { lastUpdated: 0, isFetching: false, items: {} },
  action = undefined
) {
  switch (action.type) {
    case types.ORGANIZATIONS_LOAD:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: true,
        items: state.items,
      };

    case types.ORGANIZATIONS_LOAD_SUCCESS:
      return {
        lastUpdated: Date.now(),
        isFetching: false,
        items: action.organizations,
      };

    case types.ORGANIZATIONS_LOAD_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items,
      };

    case types.ORGANIZATION_DELETE_CONFIRMED:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: state.isFetching,
        items: state.items,
      };

    case types.ORGANIZATION_DELETE_ERROR:
      return {
        lastUpdated: state.lastUpdated,
        isFetching: false,
        items: state.items,
      };

    case types.ORGANIZATION_CREDENTIALS_SET:
      return {
        showCredentialsForm: true,
        items: state.items,
      };

    case types.ORGANIZATION_CREDENTIALS_SET_CONFIRMED:
      return {
        showCredentialsForm: true,
        items: state.items,
      };

    case types.ORGANIZATION_CREDENTIALS_SET_ERROR:
      return {
        showCredentialsForm: true,
        items: state.items,
      };

    case types.ORGANIZATION_CREDENTIALS_SET_SUCCESS:
      return {
        showCredentialsForm: false,
        items: state.items,
      };

    default:
      return state;
  }
}
