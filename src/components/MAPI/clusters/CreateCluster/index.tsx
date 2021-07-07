import { push } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import produce from 'immer';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import RoutePath from 'lib/routePath';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import { generateUID } from 'MAPI/utils';
import React, { useReducer } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { Providers } from 'shared/constants';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { PropertiesOf } from 'shared/types';
import { getProvider } from 'stores/main/selectors';
import { getNamespaceFromOrgName } from 'stores/main/utils';
import Button from 'UI/Controls/Button';

import {
  createDefaultCluster,
  createDefaultControlPlaneNode,
  createDefaultProviderCluster,
} from '../utils';
import { ClusterPatch } from './patches';

enum ClusterPropertyField {
  Name,
}

interface IApplyPatchAction {
  type: 'applyPatch';
  property: ClusterPropertyField;
  value: ClusterPatch;
}

interface IChangeValidationResultAction {
  type: 'changeValidationStatus';
  property: ClusterPropertyField;
  value: boolean;
}

interface IStartCreationAction {
  type: 'startCreation';
}

interface IEndCreationAction {
  type: 'endCreation';
}

type ClusterAction =
  | IApplyPatchAction
  | IChangeValidationResultAction
  | IStartCreationAction
  | IEndCreationAction;

interface IClusterState {
  provider: PropertiesOf<typeof Providers>;
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNode: ControlPlaneNode;
  validationResults: Record<ClusterPropertyField, boolean>;
  isCreating: boolean;
}

interface IReducerConfig {
  namespace: string;
  organization: string;
  releaseVersion: string;
}

function makeInitialState(
  provider: PropertiesOf<typeof Providers>,
  config: IReducerConfig
): IClusterState {
  const name = generateUID(5);

  const resourceConfig = { ...config, name };
  const controlPlaneNode = createDefaultControlPlaneNode(
    provider,
    resourceConfig
  );
  const providerCluster = createDefaultProviderCluster(
    provider,
    resourceConfig
  );
  const cluster = createDefaultCluster({
    providerCluster,
  });

  return {
    provider,
    cluster,
    providerCluster,
    controlPlaneNode,
    validationResults: {
      [ClusterPropertyField.Name]: true,
    },
    isCreating: false,
  };
}

const reducer: React.Reducer<IClusterState, ClusterAction> = produce(
  (draft, action) => {
    switch (action.type) {
      case 'applyPatch':
        action.value(
          draft.cluster,
          draft.providerCluster,
          draft.controlPlaneNode
        );
        break;
      case 'changeValidationStatus':
        draft.validationResults[action.property] = action.value;
        break;
      case 'startCreation':
        draft.isCreating = true;
        break;
      case 'endCreation': {
        draft.isCreating = false;
        break;
      }
    }
  }
);

interface ICreateClusterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const CreateCluster: React.FC<ICreateClusterProps> = (props) => {
  const match = useRouteMatch<{ orgId: string }>();
  const { orgId } = match.params;
  const namespace = getNamespaceFromOrgName(orgId);

  // TODO(axbarsan): Compute latest release.
  const latestRelease = '';

  const provider = useSelector(getProvider);

  const [state, dispatch] = useReducer(
    reducer,
    makeInitialState(provider, {
      namespace,
      organization: orgId,
      releaseVersion: latestRelease,
    })
  );

  const globalDispatch = useDispatch();

  const handleCancel = () => {
    dispatch({ type: 'endCreation' });

    globalDispatch(push(MainRoutes.Home));
  };

  const isValid = Object.values(state.validationResults).every((r) => r);

  const handleCreation = (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    dispatch({ type: 'startCreation' });

    try {
      // TODO(axbarsan): Actually create the cluster.

      dispatch({ type: 'endCreation' });

      new FlashMessage(
        `Cluster <code>${state.cluster.metadata.name}</code> created successfully`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );

      // Navigate to the cluster's detail page.
      const detailPath = RoutePath.createUsablePath(
        OrganizationsRoutes.Clusters.Detail.Home,
        { orgId, clusterId: state.cluster.metadata.name }
      );
      globalDispatch(push(detailPath));
    } catch (err) {
      dispatch({ type: 'endCreation' });

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Could not create cluster <code>${state.cluster.metadata.name}</code>`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  return (
    <Breadcrumb data={{ title: 'CREATE CLUSTER', pathname: match.url }}>
      <DocumentTitle title={`Create Cluster | ${orgId}`}>
        <Box {...props}>
          <Box border={{ side: 'bottom' }} margin={{ bottom: 'large' }}>
            <Heading level={1}>Create a cluster</Heading>
          </Box>
          <Box as='form' onSubmit={handleCreation}>
            <Box direction='row' margin={{ top: 'medium' }}>
              <Button
                bsStyle='primary'
                disabled={!isValid}
                type='submit'
                loading={state.isCreating}
              >
                Create Cluster
              </Button>

              {!state.isCreating && (
                <Button bsStyle='default' onClick={handleCancel}>
                  Cancel
                </Button>
              )}
            </Box>
            <Box margin={{ top: 'medium' }}>
              <Text color='text-weak'>
                Note that it takes around 30 minutes on average until a new
                cluster is fully available.
              </Text>
            </Box>
          </Box>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

CreateCluster.propTypes = {};

export default CreateCluster;
