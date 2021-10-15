import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import { useHttpClientFactory } from 'lib/hooks/useHttpClientFactory';
import { NodePool, ProviderNodePool } from 'MAPI/types';
import { extractErrorMessage, getNodePoolScaling } from 'MAPI/utils';
import React, { useMemo, useState } from 'react';
import NodeCountSelector from 'shared/NodeCountSelector';
import Button from 'UI/Controls/Button';
import ConfirmationPrompt from 'UI/Controls/ConfirmationPrompt';

import { updateNodePoolScaling } from './utils';

function formatNodesLabel(nodesCount: number): string {
  if (nodesCount === 1) {
    return 'node';
  }

  return 'nodes';
}

function getWorkerNodesDifference(min: number, max: number, desired: number) {
  if (min > desired) {
    return min - desired;
  } else if (max < desired) {
    return max - desired;
  }

  return 0;
}

function getSubmitButtonAttributes(fromValue: {
  min: number;
  minValid: boolean;
  max: number;
  maxValid: boolean;
  initialScaling: ReturnType<typeof getNodePoolScaling>;
}): { disabled: boolean; label: string; primary?: boolean; danger?: boolean } {
  const { min, minValid, max, maxValid, initialScaling } = fromValue;

  const nodesDifference = getWorkerNodesDifference(
    min,
    max,
    initialScaling.desired
  );

  const isValid =
    minValid &&
    maxValid &&
    (min !== initialScaling.min || max !== initialScaling.max);

  if (nodesDifference > 0 && initialScaling.desired > 0) {
    return {
      label: `Increase minimum number of nodes by ${nodesDifference}`,
      primary: true,
      disabled: !isValid,
    };
  } else if (nodesDifference < 0 && initialScaling.desired > 0) {
    const nodesLabel = formatNodesLabel(Math.abs(nodesDifference));

    return {
      label: `Remove ${Math.abs(nodesDifference)} ${nodesLabel}`,
      danger: true,
      disabled: !isValid,
    };
  }

  return {
    label: 'Apply',
    primary: true,
    disabled: !isValid,
  };
}

interface IWorkerNodesNodePoolItemScaleProps
  extends React.ComponentPropsWithoutRef<typeof ConfirmationPrompt> {
  nodePool: NodePool;
  providerNodePool: ProviderNodePool;
}

const WorkerNodesNodePoolItemScale: React.FC<IWorkerNodesNodePoolItemScaleProps> =
  ({ nodePool, providerNodePool, onConfirm, onCancel, open, ...props }) => {
    const initialScaling = useMemo(
      () => getNodePoolScaling(nodePool, providerNodePool),
      [nodePool, providerNodePool]
    );

    const [scalingMin, setScalingMin] = useState(initialScaling.min);
    const [scalingMinValid, setScalingMinValid] = useState(true);
    const [scalingMax, setScalingMax] = useState(initialScaling.max);
    const [scalingMaxValid, setScalingMaxValid] = useState(true);

    const handleScaleChange = (newValue: {
      scaling: {
        min: number;
        minValid: boolean;
        max: number;
        maxValid: boolean;
      };
    }) => {
      /**
       * When the confirmation prompt is closed, and we reset the values,
       * the `min` and the `max` limits of the 2 inputs would change,
       * which would make the underlying `NumberPicker` components call this
       * callback, with partial values, therefore preventing the full reset
       * from happening.
       */
      if (!open) return;

      const { min, minValid, max, maxValid } = newValue.scaling;

      setScalingMin(min);
      setScalingMinValid(minValid);
      setScalingMax(max);
      setScalingMaxValid(maxValid);
    };

    const handleCancel = () => {
      onCancel?.();

      setScalingMin(initialScaling.min);
      setScalingMinValid(true);
      setScalingMax(initialScaling.max);
      setScalingMaxValid(true);
    };

    const clientFactory = useHttpClientFactory();
    const auth = useAuthProvider();

    const [isLoading, setIsLoading] = useState(false);

    const handleScale = async () => {
      setIsLoading(true);

      try {
        await updateNodePoolScaling(
          clientFactory(),
          auth,
          nodePool,
          scalingMin,
          scalingMax
        );

        onConfirm?.();
        setTimeout(() => {
          setIsLoading(false);
          // eslint-disable-next-line no-magic-numbers
        }, 200);

        new FlashMessage(
          (
            <>
              Node pool <code>{nodePool.metadata.name}</code> updated
              successfully
            </>
          ),
          messageType.SUCCESS,
          messageTTL.SHORT
        );
      } catch (err) {
        setIsLoading(false);

        const errorMessage = extractErrorMessage(err);

        new FlashMessage(
          (
            <>
              Could not update node pool <code>{nodePool.metadata.name}</code>
            </>
          ),
          messageType.ERROR,
          messageTTL.FOREVER,
          errorMessage
        );

        ErrorReporter.getInstance().notify(err as Error);
      }
    };

    const submitButtonAttributes = useMemo(
      () =>
        getSubmitButtonAttributes({
          min: scalingMin,
          minValid: scalingMinValid,
          max: scalingMax,
          maxValid: scalingMaxValid,
          initialScaling,
        }),
      [scalingMin, scalingMinValid, scalingMax, scalingMaxValid, initialScaling]
    );

    const nodesDifference = getWorkerNodesDifference(
      scalingMin,
      scalingMax,
      initialScaling.desired
    );

    return (
      <ConfirmationPrompt
        onConfirm={handleScale}
        confirmButton={
          <Button
            primary={submitButtonAttributes.primary}
            danger={submitButtonAttributes.danger}
            onClick={handleScale}
            loading={isLoading}
            disabled={submitButtonAttributes.disabled}
          >
            {submitButtonAttributes.label}
          </Button>
        }
        onCancel={!isLoading ? handleCancel : undefined}
        title='Edit scaling limits'
        open={open}
        {...props}
      >
        <Box>
          <Text>
            Set the scaling range and let the autoscaler set the effective
            number of worker nodes based on the usage.
          </Text>
        </Box>
        <Box width={{ max: 'large' }} margin={{ top: 'small' }}>
          <NodeCountSelector
            autoscalingEnabled={true}
            readOnly={isLoading}
            onChange={handleScaleChange}
            scaling={{
              min: scalingMin,
              minValid: scalingMinValid,
              max: scalingMax,
              maxValid: scalingMaxValid,
            }}
          />
        </Box>

        {nodesDifference < 0 && (
          <Box margin={{ top: 'small' }} width={{ max: 'large' }}>
            <Text color='status-warning'>
              <i
                className='fa fa-warning'
                role='presentation'
                aria-hidden={true}
              />{' '}
              The node pool currently has {initialScaling.desired} worker{' '}
              {formatNodesLabel(initialScaling.desired)} running. By setting the
              maximum lower than that, you enforce the removal of{' '}
              {Math.abs(nodesDifference)}{' '}
              {formatNodesLabel(Math.abs(nodesDifference))}. This could result
              in unscheduled workloads.
            </Text>
          </Box>
        )}
      </ConfirmationPrompt>
    );
  };

export default WorkerNodesNodePoolItemScale;
