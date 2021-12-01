import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Collapsible, Heading, Keyboard } from 'grommet';
import produce from 'immer';
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
import { Providers } from 'model/constants';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import { supportsNodePoolSpotInstances } from 'model/stores/nodepool/utils';
import React, { useReducer } from 'react';
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

type NodePoolAction =
  | IApplyPatchAction
  | IChangeValidationResultAction
  | IStartCreationAction
  | IEndCreationAction;

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
      case 'endCreation': {
        // Reset to initial state.
        const newState = makeInitialState(draft.provider, {
          clusterName: draft.nodePool.spec!.clusterName,
          namespace: draft.nodePool.metadata.namespace!,
          location: getProviderNodePoolLocation(draft.providerNodePool),
          organization:
            draft.nodePool.metadata.labels![capiv1alpha3.labelOrganization],
        });
        draft.nodePool = newState.nodePool;
        draft.providerNodePool = newState.providerNodePool;
        draft.bootstrapConfig = newState.bootstrapConfig;
        draft.validationResults = newState.validationResults;
        draft.isCreating = false;
        break;
      }
    }
  }
);

interface IWorkerNodesCreateNodePoolProps
  extends React.ComponentPropsWithoutRef<typeof Collapsible> {
  cluster: Cluster;
  providerCluster: ProviderCluster;
  id: string;
  onCancel?: () => void;
}

const WorkerNodesCreateNodePool: React.FC<IWorkerNodesCreateNodePoolProps> = ({
  cluster,
  providerCluster,
  id,
  onCancel,
  ...props
}) => {
  const provider = window.config.info.general.provider;

  const [state, dispatch] = useReducer(
    reducer,
    makeInitialState(provider, {
      clusterName: cluster.metadata.name,
      namespace: cluster.metadata.namespace!,
      organization: cluster.metadata.labels![capiv1alpha3.labelOrganization],
      location: getProviderClusterLocation(providerCluster)!,
    })
  );

  const handleCancel = () => {
    onCancel?.();
    setTimeout(() => {
      dispatch({ type: 'endCreation' });
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

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const handleCreation = async (e: React.FormEvent<HTMLElement>) => {
    e.preventDefault();

    dispatch({ type: 'startCreation' });

    try {
      await createNodePool(clientFactory(), auth, state);

      onCancel?.();
      setTimeout(() => {
        dispatch({ type: 'endCreation' });
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
            <code>{state.nodePool.metadata.name}</code>
          </>
        ),
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as Error);
    }
  };

  const clusterReleaseVersion = getClusterReleaseVersion(cluster);
  const supportsSpotInstances = clusterReleaseVersion
    ? supportsNodePoolSpotInstances(provider, clusterReleaseVersion)
    : false;
  const orgName =
    state.nodePool.metadata.labels![capiv1alpha3.labelOrganization];
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
