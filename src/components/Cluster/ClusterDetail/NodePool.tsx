import styled from '@emotion/styled';
import * as nodePoolActions from 'actions/nodePoolActions';
import { spinner } from 'images';
import { ErrorReporter } from 'lib/errors';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { connect, DispatchProp } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { INodePool } from 'shared/types';
import { Code, Ellipsis } from 'styles/';
import ViewAndEditName from 'UI/ViewEditName';

import AvailabilityZonesWrapper from './AvailabilityZonesWrapper';
import NodePoolDropdownMenu from './NodePoolDropdownMenu';
import ScaleNodePoolModal from './ScaleNodePoolModal';

const NPViewAndEditNameStyled = styled(ViewAndEditName)`
  input[type='text'] {
    font-size: 15px;
    line-height: 1.8em;
    margin-bottom: 0;
  }
  .btn-group {
    top: 0;
  }
  button {
    font-size: 13px;
    padding: 4px 10px;
  }
`;

const NodesWrapper = styled.div<{ highlight?: boolean }>`
  width: 36px;
  height: 30px;
  line-height: 31px;
  text-align: center;
  border-radius: 3px;
  white-space: nowrap;
  background-color: ${({ theme, highlight }) =>
    highlight && theme.colors.goldBackground};
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

interface IStateProps {
  nodePool: INodePool;
}

interface IDispatchProps extends DispatchProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodePoolActions: Record<string, (...args: any[]) => Promise<any>>;
}

interface INodePoolsProps extends IStateProps, IDispatchProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cluster: any;
  provider: string;
}

interface INodePoolsState {
  isNameBeingEdited: boolean;
}

interface IScaleNodePoolModal {
  reset: () => void;
  show: () => void;
  setNodePool: (nodePool: INodePool) => void;
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
    nodePoolActions: PropTypes.object,
    // @ts-ignore
    dispatch: PropTypes.func,
    // @ts-ignore
    provider: PropTypes.string,
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
    // eslint-disable-next-line no-unused-expressions
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
      ErrorReporter.getInstance().notify(err);
    }
  };

  deleteNodePool = (): void => {
    this.props.dispatch(
      // @ts-ignore
      this.props.nodePoolActions.nodePoolDelete(
        // @ts-ignore
        this.props.cluster.id,
        this.props.nodePool
      )
    );
  };

  showNodePoolScalingModal = (nodePool: INodePool): void => {
    // eslint-disable-next-line no-unused-expressions
    this.scaleNodePoolModal?.reset();
    // eslint-disable-next-line no-unused-expressions
    this.scaleNodePoolModal?.show();
    // eslint-disable-next-line no-unused-expressions
    this.scaleNodePoolModal?.setNodePool(nodePool);
  };

  formatInstanceDistribution = () => {
    const { instance_distribution } = this.props.nodePool.node_spec.aws;

    const baseCapacity = instance_distribution?.on_demand_base_capacity ?? '-';
    const spotPercentage =
      /* eslint-disable-next-line no-magic-numbers */
      100 - instance_distribution?.on_demand_percentage_above_base_capacity ??
      '-';

    return (
      <>
        On-demand base capacity: {baseCapacity}
        <br />
        Spot instance percentage: {spotPercentage}
      </>
    );
  };

  formatInstanceTypes = () => {
    const {
      id,
      status: { instance_types },
      node_spec: {
        aws: { use_alike_instance_types, instance_type },
      },
    } = this.props.nodePool;

    if (!use_alike_instance_types) {
      return <Code>{instance_type}</Code>;
    }

    const instanceTypesAvailable = Boolean(instance_types);

    return (
      <OverlayTrigger
        overlay={
          <Tooltip id={`${id}-instance-types`}>
            Similar instances enabled.
            <br />
            {instanceTypesAvailable
              ? `Currently used: ${instance_types.join(', ')}`
              : 'Unable to display used instance types'}
          </Tooltip>
        }
        placement='top'
      >
        <InstanceTypesWrapperDiv>
          <MixedInstanceType>{instance_type}</MixedInstanceType>
          {instanceTypesAvailable && instance_types.length > 1 && (
            <small>+{instance_types.length - 1}</small>
          )}
        </InstanceTypesWrapperDiv>
      </OverlayTrigger>
    );
  };

  render() {
    if (!this.props.nodePool) {
      return <img className='loader' src={spinner} />;
    }
    const { cluster, nodePool } = this.props;
    const { id, scaling, availability_zones, status } = nodePool;
    const { nodes_ready: current, nodes: desired, spot_instances } = status;
    const { isNameBeingEdited } = this.state;

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
            ref={(viewEditName: HTMLSpanElement | null): void => {
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
            <NodesWrapper data-testid='scaling-min'>{scaling.min}</NodesWrapper>
            <NodesWrapper data-testid='scaling-max'>{scaling.max}</NodesWrapper>
            <NodesWrapper>{desired}</NodesWrapper>
            <NodesWrapper highlight={current < desired}>{current}</NodesWrapper>
            {typeof spot_instances === 'number' ? (
              <OverlayTrigger
                overlay={
                  <Tooltip id={`${id}-spot-distribution-tooltip`}>
                    {this.formatInstanceDistribution()}
                  </Tooltip>
                }
                placement='top'
              >
                <NodesWrapper>{spot_instances}</NodesWrapper>
              </OverlayTrigger>
            ) : (
              <NodesWrapper />
            )}
            <NodePoolDropdownMenu
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
          provider={this.props.provider}
          ref={(s: IScaleNodePoolModal): void => {
            this.scaleNodePoolModal = s;
          }}
          workerNodesDesired={desired}
          workerNodesRunning={current}
        />
      </>
    );
  }
}

function mapStateToProps(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  state: Record<string, any>,
  ownProps: INodePoolsProps
) {
  return {
    nodePool: state.entities.nodePools.items[ownProps.nodePool.id],
  };
}

function mapDispatchToProps(dispatch: Dispatch): IDispatchProps {
  return {
    // @ts-ignore
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch,
  };
}

// @ts-ignore
export default connect(mapStateToProps, mapDispatchToProps)(NodePool);
