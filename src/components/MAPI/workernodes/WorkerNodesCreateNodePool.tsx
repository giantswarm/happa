import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Collapsible, Heading, Keyboard } from 'grommet';
import produce from 'immer';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { extractErrorMessage } from 'MAPI/organizations/utils';
import {
  BootstrapConfig,
  Cluster,
  NodePool,
  ProviderCluster,
  ProviderNodePool,
} from 'MAPI/types';
import {
  generateUID,
  getProviderClusterLocation,
  getProviderNodePoolLocation,
} from 'MAPI/utils';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import React, { useReducer } from 'react';
import { useSelector } from 'react-redux';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import { getProvider } from 'stores/main/selectors';
import Button from 'UI/Controls/Button';

import { INodePoolPropertyValue, NodePoolPatch } from './patches';
import {
  createDefaultBootstrapConfig,
  createDefaultNodePool,
  createDefaultProviderNodePool,
  createNodePool,
} from './utils';
import WorkerNodesCreateNodePoolDescription from './WorkerNodesCreateNodePoolDescription';
import WorkerNodesCreateNodePoolMachineType from './WorkerNodesCreateNodePoolMachineType';
import WorkerNodesCreateNodePoolName from './WorkerNodesCreateNodePoolName';

enum NodePoolPropertyField {
  Name,
  Description,
  MachineType,
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
          organization: draft.nodePool.metadata.labels![
            capiv1alpha3.labelOrganization
          ],
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
  const provider = useSelector(getProvider);

  const [state, dispatch] = useReducer(
    reducer,
    makeInitialState(provider, {
      clusterName: cluster.metadata.name,
      namespace: cluster.metadata.namespace!,
      organization: cluster.metadata.labels![capiv1alpha3.labelOrganization],
      location: getProviderClusterLocation(providerCluster),
    })
  );

  const handleCancel = () => {
    onCancel?.();
    setTimeout(() => {
      dispatch({ type: 'endCreation' });
      // eslint-disable-next-line no-magic-numbers
    }, 200);
  };

  const handleChange = (property: NodePoolPropertyField) => (
    newValue: INodePoolPropertyValue
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
        `Node pool <code>${state.nodePool.metadata.name}</code> created successfully`,
        messageType.SUCCESS,
        messageTTL.SHORT
      );
    } catch (err) {
      dispatch({ type: 'endCreation' });

      const errorMessage = extractErrorMessage(err);

      new FlashMessage(
        `Could not create node pool <code>${state.nodePool.metadata.name}</code>`,
        messageType.ERROR,
        messageTTL.LONG,
        errorMessage
      );

      ErrorReporter.getInstance().notify(err as never);
    }
  };

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
                onChange={handleChange(NodePoolPropertyField.MachineType)}
              />
              <Box direction='row' margin={{ top: 'medium' }}>
                <Button
                  bsStyle='primary'
                  disabled={!isValid}
                  type='submit'
                  loading={state.isCreating}
                >
                  Create node pool
                </Button>

                {!state.isCreating && (
                  <Button bsStyle='default' onClick={handleCancel}>
                    Cancel
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </form>
      </Keyboard>
    </Collapsible>
  );
};

WorkerNodesCreateNodePool.propTypes = {
  cluster: (PropTypes.object as PropTypes.Requireable<Cluster>).isRequired,
  providerCluster: (PropTypes.object as PropTypes.Requireable<ProviderCluster>)
    .isRequired,
  id: PropTypes.string.isRequired,
  onCancel: PropTypes.func,
};

export default WorkerNodesCreateNodePool;
