import NodePoolScaling from 'Cluster/ClusterDetail/NodePoolScaling';
import { spinner } from 'images';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { connect, DispatchProp } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Providers } from 'shared/constants';
import { INodePool, PropertiesOf } from 'shared/types';
import * as nodePoolActions from 'stores/nodepool/actions';
import styled from 'styled-components';
import { Code, Ellipsis } from 'styles/';
import ViewAndEditName from 'UI/Inputs/ViewEditName';

import AvailabilityZonesWrapper from './AvailabilityZonesWrapper';
import NodePoolDropdownMenu from './NodePoolDropdownMenu';
import ScaleNodePoolModal from './ScaleNodePoolModal';

const NPViewAndEditNameStyled = styled(ViewAndEditName)`
  .btn-group {
    top: 0;
  }
  button {
    font-size: 13px;
    padding: 4px 10px;
  }
`;

const NameWrapperDiv = styled.div`
  padding-left: 8px;
  justify-self: left;
  width: 100%;
  white-space: nowrap;
  display: inline-block;
  span {
    display: flex;
  }
  a {
    ${Ellipsis};
    display: inline-block;
  }
`;

const InstanceTypesWrapperDiv = styled.div`
  position: relative;
  small {
    display: inline-block;
    position: absolute;
    top: 4px;
    margin-left: 8px;
  }
`;

const MixedInstanceType = styled(Code)`
  background-color: ${({ theme }) => theme.colors.shade9};
`;

interface INPViewAndEditName extends HTMLSpanElement {
  activateEditMode: () => boolean;
}

interface IScaleNodePoolModal {
  reset: () => void;
  show: () => void;
  setNodePool: (nodePool: INodePool) => void;
}

interface IStateProps {
  nodePool: INodePool;
}

interface IDispatchProps extends DispatchProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodePoolActions: Record<string, (...args: any[]) => Promise<any>>;
}

interface INodePoolsProps extends IStateProps, IDispatchProps {
  cluster: Cluster;
  provider: PropertiesOf<typeof Providers>;
  supportsAutoscaling?: boolean;
  supportsSpotInstances?: boolean;
}

interface INodePoolsState {
  isNameBeingEdited: boolean;
}

class NodePool extends Component<INodePoolsProps, INodePoolsState> {
  public static propTypes = {
    /**
     * We skip typechecking because we don't want to define the whole object
     * structure (for now)
     */
    cluster: PropTypes.object,
    // @ts-ignore
    nodePool: PropTypes.shape({
      availability_zones: PropTypes.any, // TODO fix it.
      id: PropTypes.string,
      name: PropTypes.string,
      node_spec: PropTypes.object,
      scaling: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number,
      }),
      status: PropTypes.shape({
        nodes: PropTypes.number,
        nodes_ready: PropTypes.number,
      }),
    }),
    // @ts-ignore
    dispatch: PropTypes.func,
    // @ts-ignore
    provider: PropTypes.string,
    supportsAutoscaling: PropTypes.bool,
    supportsSpotInstances: PropTypes.bool,
  };

  public static defaultProps = {
    supportsAutoscaling: false,
    supportsSpotInstances: false,
  };

  public readonly state: INodePoolsState = {
    isNameBeingEdited: false,
  };

  private viewEditNameRef: INPViewAndEditName | null = null;
  private scaleNodePoolModal: IScaleNodePoolModal | null = null;

  toggleEditingState = (isNameBeingEdited: boolean): void => {
    this.setState({ isNameBeingEdited });
  };

  triggerEditName = () => {
    this.viewEditNameRef?.activateEditMode();
  };

  editNodePoolName = (name: string): void => {
    const { cluster, nodePool } = this.props;

    try {
      this.props.dispatch(
        // @ts-ignore
        nodePoolActions.nodePoolPatch(cluster.id, nodePool, { name })
      );
    } catch (err) {
      let errorMessage = `Something went wrong while trying to update the node pool's name.`;
      if (err.response?.message || err.message) {
        errorMessage = `There was a problem updating the node pool's name: ${
          err.response?.message ?? err.message
        }`;
      }
      new FlashMessage(
        errorMessage,
        messageType.ERROR,
        messageTTL.MEDIUM,
        'Please try again later or contact support: support@giantswarm.io'
      );

      ErrorReporter.getInstance().notify(err);
    }
  };

  deleteNodePool = (): void => {
    this.props.dispatch(
      nodePoolActions.nodePoolDelete(
        // @ts-ignore
        this.props.cluster.id,
        this.props.nodePool
      )
    );
  };

  showNodePoolScalingModal = (nodePool: INodePool): void => {
    this.scaleNodePoolModal?.reset();
    this.scaleNodePoolModal?.show();
    this.scaleNodePoolModal?.setNodePool(nodePool);
  };

  formatInstanceTypes = () => {
    const { id, status, node_spec } = this.props.nodePool;

    if (node_spec?.aws && !node_spec.aws.use_alike_instance_types) {
      return <Code>{node_spec.aws.instance_type}</Code>;
    }

    if (node_spec?.azure) {
      return <Code>{node_spec.azure.vm_size}</Code>;
    }

    // Alike instance types.
    const instanceTypes = status?.instance_types ?? null;

    return (
      <OverlayTrigger
        overlay={
          <Tooltip id={`${id}-instance-types`}>
            Similar instances enabled.
            <br />
            {instanceTypes
              ? `Currently used: ${instanceTypes.join(', ')}`
              : 'Unable to display used instance types'}
          </Tooltip>
        }
        placement='top'
      >
        <InstanceTypesWrapperDiv>
          <MixedInstanceType>
            {node_spec?.aws?.instance_type ?? ''}
          </MixedInstanceType>
          {instanceTypes && instanceTypes.length > 1 && (
            <small>+{instanceTypes.length - 1}</small>
          )}
        </InstanceTypesWrapperDiv>
      </OverlayTrigger>
    );
  };

  render() {
    if (!this.props.nodePool) {
      return <img className='loader' src={spinner} alt='' />;
    }
    const {
      cluster,
      nodePool,
      provider,
      supportsAutoscaling,
      supportsSpotInstances,
    } = this.props;
    const { id, availability_zones, status } = nodePool;
    const { isNameBeingEdited } = this.state;

    const current = status?.nodes_ready ?? 0;
    const desired = status?.nodes ?? 0;

    return (
      <>
        <Code data-testid='node-pool-id'>{id}</Code>
        {/* Applying style here because is super specific for this element and can't use nth-child with emotion */}
        <NameWrapperDiv
          style={{ gridColumn: isNameBeingEdited ? '2 / 9' : undefined }}
        >
          <NPViewAndEditNameStyled
            value={nodePool.name}
            typeLabel='node pool'
            onSave={this.editNodePoolName}
            ref={(viewEditName: unknown) => {
              this.viewEditNameRef = viewEditName as INPViewAndEditName;
            }}
            onToggleEditingState={this.toggleEditingState}
          />
        </NameWrapperDiv>
        {/* Hide the rest of fields when editing name */}
        {!isNameBeingEdited && (
          <>
            {this.formatInstanceTypes()}
            <div>
              <AvailabilityZonesWrapper zones={availability_zones} />
            </div>
            <NodePoolScaling
              nodePool={nodePool}
              provider={provider}
              supportsAutoscaling={supportsAutoscaling}
              supportsSpotInstances={supportsSpotInstances}
            />
            <NodePoolDropdownMenu
              provider={provider}
              clusterId={cluster.id}
              nodePool={nodePool}
              deleteNodePool={this.deleteNodePool}
              showNodePoolScalingModal={this.showNodePoolScalingModal}
              triggerEditName={this.triggerEditName}
            />
          </>
        )}
        <ScaleNodePoolModal
          cluster={cluster}
          nodePool={nodePool}
          ref={(s) => {
            this.scaleNodePoolModal = s;
          }}
          workerNodesDesired={desired}
          workerNodesRunning={current}
          supportsAutoscaling={supportsAutoscaling}
        />
      </>
    );
  }
}

function mapDispatchToProps(dispatch: Dispatch): IDispatchProps {
  return {
    // @ts-ignore
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch,
  };
}

// @ts-ignore
export default connect(null, mapDispatchToProps)(NodePool);
