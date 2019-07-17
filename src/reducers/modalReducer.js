import * as types from 'actions/actionTypes';

export default function modalReducer(
  state = { visible: false },
  action = undefined
) {
  switch (action.type) {
    case types.MODAL_HIDE:
      return Object.assign({}, state, {
        visible: false,
      });

    case types.CLUSTER_DELETE:
      return {
        visible: true,
        templateValues: {
          cluster: action.cluster,
          loading: false,
        },
        template: 'clusterDelete',
      };

    case types.CLUSTER_DELETE_CONFIRMED:
      return {
        visible: true,
        templateValues: {
          cluster: action.cluster,
          loading: true,
        },
        template: 'clusterDelete',
      };

    case types.ORGANIZATION_DELETE:
      return {
        visible: true,
        templateValues: {
          orgId: action.orgId,
          loading: false,
        },
        template: 'organizationDelete',
      };

    case types.ORGANIZATION_DELETE_CONFIRMED:
      return {
        visible: true,
        templateValues: {
          orgId: action.orgId,
          loading: true,
        },
        template: 'organizationDelete',
      };

    case types.ORGANIZATION_CREATE:
      return {
        visible: true,
        templateValues: {
          loading: false,
        },
        template: 'organizationCreate',
      };

    case types.ORGANIZATION_CREATE_CONFIRMED:
      return {
        visible: true,
        templateValues: {
          loading: true,
        },
        template: 'organizationCreate',
      };

    case types.ORGANIZATION_ADD_MEMBER:
      return {
        visible: true,
        templateValues: { orgId: action.orgId },
        template: 'organizationAddMember',
      };

    case types.ORGANIZATION_ADD_MEMBER_TYPING:
      return {
        visible: true,
        templateValues: { orgId: action.orgId, loading: false },
        template: 'organizationAddMember',
      };

    case types.ORGANIZATION_ADD_MEMBER_CONFIRMED:
      return {
        visible: true,
        templateValues: { orgId: action.orgId, loading: true },
        template: 'organizationAddMember',
      };

    case types.ORGANIZATION_ADD_MEMBER_ERROR:
      return {
        visible: true,
        templateValues: {
          orgId: action.orgId,
          loading: false,
          errorMessage: action.errorMessage,
        },
        template: 'organizationAddMember',
      };

    case types.ORGANIZATION_REMOVE_MEMBER:
      return {
        visible: true,
        templateValues: { orgId: action.orgId, email: action.email },
        template: 'organizationRemoveMember',
      };

    case types.ORGANIZATION_REMOVE_MEMBER_CONFIRMED:
      return {
        visible: true,
        templateValues: {
          orgId: action.orgId,
          email: action.email,
          loading: true,
        },
        template: 'organizationRemoveMember',
      };

    default:
      return state;
  }
}
