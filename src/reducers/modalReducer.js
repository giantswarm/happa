import * as types from 'actions/actionTypes';
import produce from 'immer';
import {
  ORGANIZATION_ADD_MEMBER_CONFIRMED,
  ORGANIZATION_ADD_MEMBER_ERROR,
  ORGANIZATION_ADD_MEMBER_REQUEST,
  ORGANIZATION_ADD_MEMBER_TYPING,
  ORGANIZATION_CREATE_CONFIRMED,
  ORGANIZATION_CREATE_REQUEST,
  ORGANIZATION_DELETE_CONFIRMED,
  ORGANIZATION_DELETE_REQUEST,
  ORGANIZATION_REMOVE_MEMBER,
  ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST,
} from 'stores/organization/constants';

const initialState = { visible: false };

const modalReducer = produce((draft, action) => {
  switch (action.type) {
    case types.MODAL_HIDE:
      draft.visible = false;

      break;

    case types.ROUTER_LOCATION_CHANGE:
      if (!action.payload.isFirstRendering) {
        draft.visible = false;
      }

      break;

    case types.CLUSTER_DELETE_REQUEST:
      draft.visible = true;
      draft.templateValues = { cluster: action.cluster, loading: false };
      draft.template = 'clusterDelete';

      break;

    case types.CLUSTER_DELETE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { cluster: action.cluster, loading: true };
      draft.template = 'clusterDelete';

      break;

    case ORGANIZATION_DELETE_REQUEST:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: false };
      draft.template = 'organizationDelete';

      break;

    case ORGANIZATION_DELETE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: true };
      draft.template = 'organizationDelete';

      break;

    case ORGANIZATION_CREATE_REQUEST:
      draft.visible = true;
      draft.templateValues = { loading: false };
      draft.template = 'organizationCreate';

      break;

    case ORGANIZATION_CREATE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { loading: true };
      draft.template = 'organizationCreate';

      break;

    case ORGANIZATION_ADD_MEMBER_REQUEST:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId };
      draft.template = 'organizationAddMember';

      break;

    case ORGANIZATION_ADD_MEMBER_TYPING:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: false };
      draft.template = 'organizationAddMember';

      break;

    case ORGANIZATION_ADD_MEMBER_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: true };
      draft.template = 'organizationAddMember';

      break;

    case ORGANIZATION_ADD_MEMBER_ERROR:
      draft.visible = true;
      draft.templateValues = {
        orgId: action.orgId,
        loading: false,
        errorMessage: action.errorMessage,
      };
      draft.template = 'organizationAddMember';

      break;

    case ORGANIZATION_REMOVE_MEMBER:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, email: action.email };
      draft.template = 'organizationRemoveMember';

      break;

    case ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST:
      draft.visible = true;
      draft.templateValues = {
        orgId: action.orgId,
        email: action.email,
        loading: true,
      };
      draft.template = 'organizationRemoveMember';

      break;

    case types.NODEPOOL_DELETE:
      draft.visible = true;
      draft.templateValues = {
        clusterId: action.clusterId,
        nodePool: action.nodePool,
        loading: false,
      };
      draft.template = 'nodePoolDelete';

      break;

    case types.NODEPOOL_DELETE_CONFIRMED_REQUEST:
      draft.visible = true;
      draft.templateValues = {
        clusterId: action.clusterId,
        nodePool: action.nodePool,
        loading: true,
      };
      draft.template = 'nodePoolDelete';
  }
}, initialState);

export default modalReducer;
