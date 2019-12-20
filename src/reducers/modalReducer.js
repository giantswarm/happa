import * as types from 'actions/actionTypes';
import produce from 'immer';

const initialState = { visible: false };

const modalReducer = produce((draft, action) => {
  switch (action.type) {
    case types.MODAL_HIDE:
      draft.visible = false;
      return;

    case types.CLUSTER_DELETE:
      draft.visible = true;
      draft.templateValues = { cluster: action.cluster, loading: false };
      draft.template = 'clusterDelete';
      return;

    case types.CLUSTER_DELETE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { cluster: action.cluster, loading: true };
      draft.template = 'clusterDelete';
      return;

    case types.ORGANIZATION_DELETE:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: false };
      draft.template = 'organizationDelete';
      return;

    case types.ORGANIZATION_DELETE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: true };
      draft.template = 'organizationDelete';
      return;

    case types.ORGANIZATION_CREATE:
      draft.visible = true;
      draft.templateValues = { loading: false };
      draft.template = 'organizationCreate';
      return;

    case types.ORGANIZATION_CREATE_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { loading: true };
      draft.template = 'organizationCreate';
      return;

    case types.ORGANIZATION_ADD_MEMBER:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId };
      draft.template = 'organizationAddMember';
      return;

    case types.ORGANIZATION_ADD_MEMBER_TYPING:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: false };
      draft.template = 'organizationAddMember';
      return;

    case types.ORGANIZATION_ADD_MEMBER_CONFIRMED:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, loading: true };
      draft.template = 'organizationAddMember';
      return;

    case types.ORGANIZATION_ADD_MEMBER_ERROR:
      draft.visible = true;
      draft.templateValues = {
        orgId: action.orgId,
        loading: false,
        errorMessage: action.errorMessage,
      };
      draft.template = 'organizationAddMember';
      return;

    case types.ORGANIZATION_REMOVE_MEMBER:
      draft.visible = true;
      draft.templateValues = { orgId: action.orgId, email: action.email };
      draft.template = 'organizationRemoveMember';
      return;

    case types.ORGANIZATION_REMOVE_MEMBER_CONFIRMED:
      draft.visible = true;
      draft.templateValues = {
        orgId: action.orgId,
        email: action.email,
        loading: true,
      };
      draft.template = 'organizationRemoveMember';
      return;

    case types.NODEPOOL_DELETE:
      draft.visible = true;
      draft.templateValues = {
        clusterId: action.clusterId,
        nodePool: action.nodePool,
        loading: false,
      };
      draft.template = 'nodePoolDelete';
      return;

    case types.NODEPOOL_DELETE_CONFIRMED:
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
