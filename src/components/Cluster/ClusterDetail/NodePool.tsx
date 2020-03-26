import styled from '@emotion/styled';
import * as nodePoolActions from 'actions/nodePoolActions';
import { spinner } from 'images';
import ErrorReporter from 'lib/ErrorReporter';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect, DispatchProp } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Code, Ellipsis } from 'styles/';
import theme from 'styles/theme';
import ViewAndEditName from 'UI/ViewEditName';

import AvailabilityZonesWrapper from './AvailabilityZonesWrapper';
import NodePoolDropdownMenu from './NodePoolDropdownMenu';
import ScaleNodePoolModal from './ScaleNodePoolModal';

const NPViewAndEditName = styled(ViewAndEditName)`
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

const NodesWrapper = styled.div`
  width: 36px;
  height: 30px;
  line-height: 31px;
  text-align: center;
  border-radius: 3px;
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
    ${Ellipsis}
    display: inline-block;
  }
`;

interface INPViewAndEditName {
  // TODO
  activateEditMode: Function;
  name: string;
}

type TNPViewAndEditName = React.Component<INPViewAndEditName>;

interface IScaling {
  min: number;
  max: number;
}

interface IStatus {
  nodes: number;
  nodes_ready: number;
}

interface INodePool {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  availability_zones: any;
  id: string;
  name: string;
  node_spec: object;
  scaling: IScaling;
  status: IStatus;
}

interface IStateProps {
  availableZonesGridTemplateAreas: string | undefined;
  cluster: object;
  nodePool: INodePool;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodePoolActions: Record<string, (...args: any[]) => Promise<any>>;
  provider: string;
}

interface INodePoolsState {
  isNameBeingEdited: boolean;
}

interface IDispatchProps extends DispatchProp {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  actions: Record<string, (...args: any[]) => Promise<any>>;
}

interface INodePoolProps extends IStateProps, IDispatchProps {}

interface IScaleNodePoolModal {
  // TODO
  reset: Function;
  show: Function;
  setNodePool: Function;
}

class NodePool extends Component<INodePoolProps, INodePoolsState> {
  static propTypes: IStateProps & IDispatchProps = {
    /**
     * We skip typechecking because we don't want to define the whole object
     * structure (for now)
     */
    // @ts-ignore
    availableZonesGridTemplateAreas: PropTypes.string,
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

  public state: INodePoolsState = {
    isNameBeingEdited: false,
  };

  private viewEditNameRef: React.RefObject<TNPViewAndEditName> | null = null;
  private scaleNodePoolModal: React.RefObject<
    IScaleNodePoolModal
  > | null = null;

  toggleEditingState = (isNameBeingEdited: boolean): void => {
    this.setState({ isNameBeingEdited });
  };

  triggerEditName = () => {
    // @ts-ignore
    this.viewEditNameRef.activateEditMode();
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
        this.props.cluster.id,
        this.props.nodePool
      )
    );
  };

  showNodePoolScalingModal = (nodePool: INodePool): void => {
    this.scaleNodePoolModal.reset();
    this.scaleNodePoolModal.show();
    this.scaleNodePoolModal.setNodePool(nodePool);
  };

  render() {
    if (!this.props.nodePool) {
      return <img className='loader' src={spinner} />;
    }
    const { availableZonesGridTemplateAreas, cluster, nodePool } = this.props;
    const { id, scaling, availability_zones, status, node_spec } = nodePool;
    const { nodes_ready: current, nodes: desired } = status;
    const { isNameBeingEdited } = this.state;

    return (
      <>
        <Code data-testid='node-pool-id'>{id}</Code>
        {/* Applying style here because is super specific for this element and can't use nth-child with emotion */}
        <NameWrapperDiv
          style={{ gridColumn: isNameBeingEdited ? '2 / 9' : undefined }}
        >
          <NPViewAndEditName
            // @ts-ignore
            name={nodePool.name}
            type='node pool'
            onSubmit={this.editNodePoolName}
            ref={(viewEditName) => (this.viewEditNameRef = viewEditName)}
            onToggleEditingState={this.toggleEditingState}
          />
        </NameWrapperDiv>
        {/* Hide the rest of fields when editing name */}
        {!isNameBeingEdited && (
          <>
            <Code>{node_spec.aws.instance_type}</Code>
            <div>
              <AvailabilityZonesWrapper
                availableZonesGridTemplateAreas={
                  availableZonesGridTemplateAreas
                }
                zones={availability_zones}
              />
            </div>
            <NodesWrapper data-testid='scaling-min'>{scaling.min}</NodesWrapper>
            <NodesWrapper data-testid='scaling-max'>{scaling.max}</NodesWrapper>
            <NodesWrapper>{desired}</NodesWrapper>
            <NodesWrapper
              style={{
                background:
                  current < desired ? theme.colors.goldBackground : undefined,
              }}
            >
              {current}
            </NodesWrapper>
            {/* Applying style here because is super specific for this element and can't use nth-child with emotion */}
            <NodePoolDropdownMenu
              // This is a div, but still TS doesn't like 'style' attr...
              // @ts-ignore
              style={{ justifySelf: 'right' }}
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
          ref={(s) => {
            this.scaleNodePoolModal = s;
          }}
          workerNodesDesired={desired}
          workerNodesRunning={current}
        />
      </>
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapStateToProps(state: Record<string, any>, ownProps: INodePoolProps) {
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
