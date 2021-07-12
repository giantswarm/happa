import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { push } from 'connected-react-router';
import { Box, Heading, Text } from 'grommet';
import produce from 'immer';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import RoutePath from 'lib/routePath';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import { Cluster, ControlPlaneNode, ProviderCluster } from 'MAPI/types';
import { generateUID } from 'MAPI/utils';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import React, { useEffect, useReducer, useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { Providers } from 'shared/constants';
import { MainRoutes, OrganizationsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { PropertiesOf } from 'shared/types';
import { getProvider } from 'stores/main/selectors';
import { getNamespaceFromOrgName } from 'stores/main/utils';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';

import {
  createCluster,
  createDefaultCluster,
  createDefaultControlPlaneNode,
  createDefaultProviderCluster,
  findLatestReleaseVersion,
} from '../utils';
import CreateClusterControlPlaneNodeAZs from './CreateClusterControlPlaneNodeAZs';
import CreateClusterDescription from './CreateClusterDescription';
import CreateClusterName from './CreateClusterName';
import CreateClusterRelease from './CreateClusterRelease';
import {
  ClusterPatch,
  IClusterPropertyValue,
  withClusterReleaseVersion,
} from './patches';

enum ClusterPropertyField {
  Name,
  Description,
  Release,
  ControlPlaneNodeAZs,
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

interface ISetLatestReleaseAction {
  type: 'setLatestRelease';
  value: string;
}

type ClusterAction =
  | IApplyPatchAction
  | IChangeValidationResultAction
  | IStartCreationAction
  | IEndCreationAction
  | ISetLatestReleaseAction;

interface IClusterState {
  provider: PropertiesOf<typeof Providers>;
  cluster: Cluster;
  providerCluster: ProviderCluster;
  controlPlaneNode: ControlPlaneNode;
  validationResults: Record<ClusterPropertyField, boolean>;
  isCreating: boolean;
  latestRelease: string;
}

interface IReducerConfig {
  namespace: string;
  organization: string;
}

function makeInitialState(
  provider: PropertiesOf<typeof Providers>,
  config: IReducerConfig
): IClusterState {
  const name = generateUID(5);

  const resourceConfig = { ...config, name, releaseVersion: '' };
  const providerCluster = createDefaultProviderCluster(
    provider,
    resourceConfig
  );
  const controlPlaneNode = createDefaultControlPlaneNode({ providerCluster });
  const cluster = createDefaultCluster({ providerCluster });

  return {
    provider,
    cluster,
    providerCluster,
    controlPlaneNode,
    validationResults: {
      [ClusterPropertyField.Name]: true,
      [ClusterPropertyField.Description]: true,
      [ClusterPropertyField.Release]: true,
      [ClusterPropertyField.ControlPlaneNodeAZs]: true,
    },
    isCreating: false,
    latestRelease: '',
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
      case 'endCreation':
        draft.isCreating = false;
        break;
      case 'setLatestRelease':
        // Apply the version to the CRs if no version was set before.
        if (!draft.latestRelease) {
          withClusterReleaseVersion(action.value)(
            draft.cluster,
            draft.providerCluster,
            draft.controlPlaneNode
          );
        }

        draft.latestRelease = action.value;
        break;
    }
  }
);

interface ICreateClusterProps
  extends React.ComponentPropsWithoutRef<typeof Box> {}

const CreateCluster: React.FC<ICreateClusterProps> = (props) => {
  const match = useRouteMatch<{ orgId: string }>();
  const { orgId } = match.params;
  const namespace = getNamespaceFromOrgName(orgId);

  const provider = useSelector(getProvider);

  const [state, dispatch] = useReducer(
    reducer,
    makeInitialState(provider, {
      namespace,
      organization: orgId,
    })
  );

  const globalDispatch = useDispatch();

  const handleCancel = () => {
    dispatch({ type: 'endCreation' });

    globalDispatch(push(MainRoutes.Home));
  };

  const handleChange = (property: ClusterPropertyField) => (
    newValue: IClusterPropertyValue
  ) => {
    dispatch({
      type: 'applyPatch',
      property,
      value: newValue.patch,
    });
    dispatch({
      type: 'changeValidationStatus',
      property,
      value: newValue.isValid,
    });
  };

  const isValid =
    state.latestRelease &&
    Object.values(state.validationResults).every((r) => r);

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const releaseListClient = useRef(clientFactory());
  const {
    data: releaseList,
    error: releaseListError,
  } = useSWR(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  useEffect(() => {
    const latestRelease = findLatestReleaseVersion(releaseList?.items ?? []);

    dispatch({
      type: 'setLatestRelease',
      value: latestRelease ?? '',
    });
  }, [releaseList?.items]);

  const handleCreation = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    dispatch({ type: 'startCreation' });

    try {
      await createCluster(clientFactory(), auth, state);

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
          <Box
            fill={true}
            border={{ side: 'bottom' }}
            margin={{ bottom: 'large' }}
          >
            <Heading level={1}>Create a cluster</Heading>
          </Box>
          <Box
            as='form'
            onSubmit={handleCreation}
            width={{ max: '100%', width: 'large' }}
            gap='medium'
            margin='auto'
          >
            <CreateClusterName
              id={`cluster-${ClusterPropertyField.Name}`}
              cluster={state.cluster}
              providerCluster={state.providerCluster}
              controlPlaneNode={state.controlPlaneNode}
              onChange={handleChange(ClusterPropertyField.Name)}
            />
            <CreateClusterDescription
              id={`cluster-${ClusterPropertyField.Description}`}
              cluster={state.cluster}
              providerCluster={state.providerCluster}
              controlPlaneNode={state.controlPlaneNode}
              onChange={handleChange(ClusterPropertyField.Description)}
              autoFocus={true}
            />
            <CreateClusterRelease
              id={`cluster-${ClusterPropertyField.Release}`}
              cluster={state.cluster}
              providerCluster={state.providerCluster}
              controlPlaneNode={state.controlPlaneNode}
              onChange={handleChange(ClusterPropertyField.Release)}
            />
            <CreateClusterControlPlaneNodeAZs
              id={`cluster-${ClusterPropertyField.ControlPlaneNodeAZs}`}
              cluster={state.cluster}
              providerCluster={state.providerCluster}
              controlPlaneNode={state.controlPlaneNode}
              onChange={handleChange(ClusterPropertyField.ControlPlaneNodeAZs)}
            />
            <Box margin={{ top: 'medium' }}>
              <Box direction='row'>
                <Button
                  bsStyle='primary'
                  disabled={!isValid}
                  type='submit'
                  loading={state.isCreating}
                >
                  Create cluster
                </Button>

                {!state.isCreating && (
                  <Button bsStyle='default' onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </Box>
              <Box margin={{ top: 'medium' }}>
                <Text color='text-weak'>
                  It will take around 15 minutes for the control plane to become
                  available.
                </Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </DocumentTitle>
    </Breadcrumb>
  );
};

CreateCluster.propTypes = {};

export default CreateCluster;
