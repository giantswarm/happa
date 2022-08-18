import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Collapsible, Heading, Keyboard } from 'grommet';
import produce from 'immer';
import { getClusterOrganization } from 'MAPI/clusters/utils';
import {
  BootstrapConfig,
  Cluster,
  NodePool,
  ProviderCluster,
  ProviderNodePool,
} from 'MAPI/types';
import {
  extractErrorMessage,
  generateUID,
  getClusterReleaseVersion,
  getNodePoolAvailabilityZones,
  getNodePoolDescription,
  getNodePoolScaling,
  getProviderClusterLocation,
  getProviderNodePoolLocation,
  getProviderNodePoolMachineTypes,
  getProviderNodePoolSpotInstances,
  INodePoolSpotInstancesAWS,
  INodePoolSpotInstancesAzure,
} from 'MAPI/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import { Providers } from 'model/constants';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as releasev1alpha1 from 'model/services/mapi/releasev1alpha1';
import { supportsNodePoolSpotInstances } from 'model/stores/nodepool/utils';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import useSWR from 'swr';
import Button from 'UI/Controls/Button';
import ErrorReporter from 'utils/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'utils/flashMessage';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import CreateNodePoolGuide from './guides/CreateNodePoolGuide';
import { INodePoolPropertyValue, NodePoolPatch } from './patches';
import {
  createDefaultBootstrapConfig,
  createDefaultNodePool,
  createDefaultProviderNodePool,
  createNodePool,
} from './utils';
import WorkerNodesCreateNodePoolAvailabilityZones from './WorkerNodesCreateNodePoolAvailabilityZones';
import WorkerNodesCreateNodePoolDescription from './WorkerNodesCreateNodePoolDescription';
import WorkerNodesCreateNodePoolMachineType from './WorkerNodesCreateNodePoolMachineType';
import WorkerNodesCreateNodePoolName from './WorkerNodesCreateNodePoolName';
import WorkerNodesCreateNodePoolScale from './WorkerNodesCreateNodePoolScale';
import WorkerNodesCreateNodePoolSpotInstances from './WorkerNodesCreateNodePoolSpotInstances';

enum NodePoolPropertyField {
  Name,
  Description,
  MachineType,
  AvailabilityZones,
  Scale,
  SpotInstances,
}

interface IApplyPatchAction {
  type: 'applyPatch';
  property: NodePoolPropertyField;
  value: NodePoolPatch;
}

interface IChangeValidationResultAction {
  type: 'changeValidationStatus';
  property: NodePoolPropertyField;
  value: boolean;
}

interface IStartCreationAction {
  type: 'startCreation';
}

interface IEndCreationAction {
  type: 'endCreation';
}

interface ISetInitialStateAction {
  type: 'setInitialState';
}

type NodePoolAction =
  | IApplyPatchAction
  | IChangeValidationResultAction
  | IStartCreationAction
  | IEndCreationAction
  | ISetInitialStateAction;

interface INodePoolState {
  provider: PropertiesOf<typeof Providers>;
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
  bootstrapConfig: BootstrapConfig;
  validationResults: Record<NodePoolPropertyField, boolean>;
  isCreating: boolean;
}

interface IReducerConfig {
  namespace: string;
  clusterName: string;
  organization: string;
  location: string;
  releaseVersion: string;
  azureOperatorVersion: string;
}

function makeInitialState(
  provider: PropertiesOf<typeof Providers>,
  config: IReducerConfig
): INodePoolState {
  const name = generateUID(5);

  const resourceConfig = { ...config, name };
  const bootstrapConfig = createDefaultBootstrapConfig(
    provider,
    resourceConfig
  );
  const providerNodePool = createDefaultProviderNodePool(
    provider,
    resourceConfig
  );
  const nodePool = createDefaultNodePool({
    bootstrapConfig,
    providerNodePool,
  });

  return {
    provider,
    nodePool,
    providerNodePool,
    bootstrapConfig,
    validationResults: {
      [NodePoolPropertyField.Name]: true,
      [NodePoolPropertyField.Description]: true,
      [NodePoolPropertyField.MachineType]: true,
      [NodePoolPropertyField.AvailabilityZones]: false,
      [NodePoolPropertyField.Scale]: true,
      [NodePoolPropertyField.SpotInstances]: true,
    },
    isCreating: false,
  };
}

const reducer: React.Reducer<INodePoolState, NodePoolAction> = produce(
  (draft, action) => {
    switch (action.type) {
      case 'applyPatch':
        action.value(draft.nodePool, draft.providerNodePool);
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
      case 'setInitialState': {
        // Reset to initial state.
        const newState = makeInitialState(draft.provider, {
          clusterName: draft.nodePool.spec!.clusterName,
          namespace: draft.nodePool.metadata.namespace!,
          location: getProviderNodePoolLocation(draft.providerNodePool),
          organization:
            draft.nodePool.metadata.labels![capiv1beta1.labelOrganization],
          releaseVersion:
            draft.nodePool.metadata.labels![capiv1beta1.labelReleaseVersion],
          azureOperatorVersion:
            draft.nodePool.metadata.labels![
              capiv1beta1.labelAzureOperatorVersion
            ],
        });
        draft.nodePool = newState.nodePool;
        draft.providerNodePool = newState.providerNodePool;
        draft.bootstrapConfig = newState.bootstrapConfig;
        draft.validationResults = newState.validationResults;
        break;
      }
    }
  }
);

function getAzureOperatorVersion(
  release: releasev1alpha1.IRelease | undefined
): string {
  return (
    release?.spec.components.find(
      (component) => component.name === 'azure-operator'
    )?.version ?? ''
  );
}

interface IWorkerNodesCreateNodePoolProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  cluster: Cluster;
  providerCluster: ProviderCluster;
  id: string;
  onCancel?: () => void;
}

const WorkerNodesCreateNodePool: React.FC<
  React.PropsWithChildren<IWorkerNodesCreateNodePoolProps>
> = ({ cluster, providerCluster, id, onCancel, ...props }) => {
  const provider = window.config.info.general.provider;

  const clientFactory = useHttpClientFactory();

  const releaseListClient = useRef(clientFactory());
  const auth = useAuthProvider();

  const { data: releaseList, error: releaseListError } = useSWR<
    releasev1alpha1.IReleaseList,
    GenericResponseError
  >(releasev1alpha1.getReleaseListKey(), () =>
    releasev1alpha1.getReleaseList(releaseListClient.current, auth)
  );

  useEffect(() => {
    if (releaseListError) {
      ErrorReporter.getInstance().notify(releaseListError);
    }
  }, [releaseListError]);

  const releaseVersion = capiv1beta1.getReleaseVersion(cluster) ?? '';

  const currentRelease = useMemo(() => {
    const formattedReleaseVersion = `v${releaseVersion}`;

    const release = releaseList?.items.find(
      (r) => r.metadata.name === formattedReleaseVersion
    );
    if (!release) return undefined;

    return release;
  }, [releaseList?.items, releaseVersion]);

  const organizations = useSelector(selectOrganizations());

  const [state, dispatch] = useReducer(
    reducer,
    makeInitialState(provider, {
      clusterName: cluster.metadata.name,
      namespace: cluster.metadata.namespace!,
      organization: getClusterOrganization(cluster, organizations)!.id,
      location: getProviderClusterLocation(providerCluster)!,
      releaseVersion: releaseVersion,
      azureOperatorVersion: getAzureOperatorVersion(currentRelease),
    })
  );

  const handleCancel = () => {
    onCancel?.();
    setTimeout(() => {
      dispatch({ type: 'endCreation' });
      dispatch({ type: 'setInitialState' });
      // eslint-disable-next-line no-magic-numbers
    }, 200);
  };

  const handleChange =
    (property: NodePoolPropertyField) => (newValue: INodePoolPropertyValue) => {
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

  const isValid = Object.values(state.validationResults).every((r) => r);

  const [isRetrying, setIsRetrying] = useState(false);

  const handleCreation = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    dispatch({ type: 'startCreation' });

    try {
      await createNodePool(clientFactory(), auth, state, isRetrying);

      onCancel?.();
      setTimeout(() => {
        dispatch({ type: 'endCreation' });
        dispatch({ type: 'setInitialState' });

        // eslint-disable-next-line no-magic-numbers
      }, 200);

      new FlashMessage(
        (
          <>
            Node pool <code>{state.nodePool.metadata.name}</code> created
            successfully
          </>
        ),
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      dispatch({ type: 'endCreation' });

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        (
          <>
            Could not create node pool{' '}
            <code>{state.nodePool.metadata.name}</code>: {errorMessage}
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        'Please try again or contact support: support@giantswarm.io'
      );

      ErrorReporter.getInstance().notify(err as Error);

      setIsRetrying(true);
    }
  };

  const clusterReleaseVersion = getClusterReleaseVersion(cluster);
  const supportsSpotInstances = clusterReleaseVersion
    ? supportsNodePoolSpotInstances(provider, clusterReleaseVersion)
    : false;
  const orgName =
    state.nodePool.metadata.labels![capiv1beta1.labelOrganization];
  const description = getNodePoolDescription(
    state.nodePool,
    state.providerNodePool
  );
  const machineType =
    getProviderNodePoolMachineTypes(state.providerNodePool)?.primary ?? '';
  const spotInstances = getProviderNodePoolSpotInstances(
    state.providerNodePool
  );
  const nodePoolAZs = getNodePoolAvailabilityZones(
    state.nodePool,
    state.providerNodePool
  );
  const scaling = getNodePoolScaling(state.nodePool, state.providerNodePool);

  return (
    <Collapsible {...props}>
      <Keyboard onEsc={handleCancel}>
        <form onSubmit={handleCreation}>
          <Box
            background='background-back'
            pad='large'
            direction='row'
            round='xsmall'
            justify='start'
            wrap={true}
          >
            <Box flex={{ grow: 0, shrink: 1 }} basis='medium'>
              <Heading level={2} margin='none'>
                Add node pool
              </Heading>
            </Box>
            <Box
              flex={{ grow: 1, shrink: 1 }}
              basis='medium'
              width={{ max: 'large' }}
              gap='small'
            >
              <WorkerNodesCreateNodePoolName
                id={`node-pool-${id}-${NodePoolPropertyField.Name}`}
                nodePool={state.nodePool}
                providerNodePool={state.providerNodePool}
                onChange={handleChange(NodePoolPropertyField.Name)}
                disabled={true}
              />
              <WorkerNodesCreateNodePoolDescription
                id={`node-pool-${id}-${NodePoolPropertyField.Description}`}
                nodePool={state.nodePool}
                providerNodePool={state.providerNodePool}
                onChange={handleChange(NodePoolPropertyField.Description)}
                autoFocus={true}
              />
              <WorkerNodesCreateNodePoolMachineType
                id={`node-pool-${id}-${NodePoolPropertyField.MachineType}`}
                nodePool={state.nodePool}
                providerNodePool={state.providerNodePool}
                cluster={cluster}
                onChange={handleChange(NodePoolPropertyField.MachineType)}
              />
              <WorkerNodesCreateNodePoolAvailabilityZones
                id={`node-pool-${id}-${NodePoolPropertyField.AvailabilityZones}`}
                nodePool={state.nodePool}
                providerNodePool={state.providerNodePool}
                onChange={handleChange(NodePoolPropertyField.AvailabilityZones)}
                cluster={cluster}
                margin={{ top: 'small' }}
              />

              {supportsSpotInstances && (
                <WorkerNodesCreateNodePoolSpotInstances
                  id={`node-pool-${id}-${NodePoolPropertyField.SpotInstances}`}
                  nodePool={state.nodePool}
                  providerNodePool={state.providerNodePool}
                  onChange={handleChange(NodePoolPropertyField.SpotInstances)}
                />
              )}

              <WorkerNodesCreateNodePoolScale
                id={`node-pool-${id}-${NodePoolPropertyField.Scale}`}
                nodePool={state.nodePool}
                providerNodePool={state.providerNodePool}
                onChange={handleChange(NodePoolPropertyField.Scale)}
              />
              <Box direction='row' margin={{ top: 'medium' }} gap='small'>
                <Button
                  primary={true}
                  disabled={!isValid}
                  type='submit'
                  loading={state.isCreating}
                >
                  Create node pool
                </Button>

                {!state.isCreating && (
                  <Button onClick={handleCancel}>Cancel</Button>
                )}
              </Box>
            </Box>
            {clusterReleaseVersion && (
              <Box
                margin={{ top: 'large' }}
                direction='column'
                gap='small'
                basis='100%'
                animation={{ type: 'fadeIn', duration: 300 }}
              >
                <CreateNodePoolGuide
                  provider={provider}
                  organizationName={orgName}
                  clusterName={cluster.metadata.name}
                  clusterReleaseVersion={clusterReleaseVersion}
                  description={description}
                  machineType={machineType}
                  nodePoolAZs={nodePoolAZs}
                  azureUseSpotVMs={spotInstances?.enabled}
                  azureSpotVMsMaxPrice={
                    (spotInstances as INodePoolSpotInstancesAzure)?.maxPrice
                  }
                  awsOnDemandBaseCapacity={
                    (spotInstances as INodePoolSpotInstancesAWS)
                      ?.onDemandBaseCapacity
                  }
                  awsOnDemandPercentageAboveBaseCapacity={
                    (spotInstances as INodePoolSpotInstancesAWS)
                      ?.onDemandPercentageAboveBaseCapacity
                  }
                  nodesMin={scaling.min}
                  nodesMax={scaling.max}
                />
              </Box>
            )}
          </Box>
        </form>
      </Keyboard>
    </Collapsible>
  );
};

export default WorkerNodesCreateNodePool;
