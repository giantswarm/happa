import produce from 'immer';
import { ClusterActions } from 'stores/cluster/types';
import { MODAL_HIDE } from 'stores/modal/constants';
import { IModalState, ModalActions } from 'stores/modal/types';
import {
  NODEPOOL_DELETE,
  NODEPOOL_DELETE_CONFIRMED_REQUEST,
} from 'stores/nodepool/constants';
import { NodePoolActions } from 'stores/nodepool/types';
import {
  ORGANIZATION_ADD_MEMBER_CONFIRMED,
  ORGANIZATION_ADD_MEMBER_ERROR,
  ORGANIZATION_ADD_MEMBER_REQUEST,
  ORGANIZATION_CREATE_CONFIRMED,
  ORGANIZATION_CREATE_REQUEST,
  ORGANIZATION_DELETE_CONFIRMED,
  ORGANIZATION_DELETE_REQUEST,
  ORGANIZATION_REMOVE_MEMBER,
  ORGANIZATION_REMOVE_MEMBER_CONFIRMED_REQUEST,
} from 'stores/organization/constants';
import { OrganizationActions } from 'stores/organization/types';
import { ROUTER_LOCATION_CHANGE } from 'stores/router/constants';
import { RouterActions } from 'stores/router/types';

const initialState: IModalState = {
  visible: false,
  templateValues: {},
  template: '',
};

const modalReducer = produce(
  (
    draft: IModalState,
    action:
      | ModalActions
      | OrganizationActions
      | NodePoolActions
      | ClusterActions
      | RouterActions
  ) => {
    switch (action.type) {
      case MODAL_HIDE:
        draft.visible = false;

        break;

      case ROUTER_LOCATION_CHANGE:
        if (!action.payload.isFirstRendering) {
          draft.visible = false;
        }

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

      case NODEPOOL_DELETE:
        draft.visible = true;
        draft.templateValues = {
          clusterId: action.clusterID,
          nodePool: action.nodePool,
          loading: false,
        };
        draft.template = 'nodePoolDelete';

        break;

      case NODEPOOL_DELETE_CONFIRMED_REQUEST:
        draft.visible = true;
        draft.templateValues = {
          clusterId: action.clusterID,
          nodePool: action.nodePool,
          loading: true,
        };
        draft.template = 'nodePoolDelete';

        break;
    }
  },
  initialState
);

export default modalReducer;
