import * as nodePoolActions from 'actions/nodePoolActions';
import { bindActionCreators } from 'redux';
import { Code } from 'styles/';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { nodePoolPatch } from 'actions/nodePoolActions';
import { spinner } from 'images';
import AvailabilityZonesWrapper from './AvailabilityZonesWrapper';
import NodePoolDropdownMenu from './NodePoolDropdownMenu';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ScaleNodePoolModal from './ScaleNodePoolModal';
import styled from '@emotion/styled';
import theme from 'styles/theme';
import ViewAndEditName from 'UI/view_edit_name';

const NodesWrapper = styled.div`
  width: 36px;
  height: 30px;
  line-height: 31px;
  text-align: center;
  border-radius: 3px;
`;

class NodePool extends Component {
  state = {
    isNameBeingEdited: false,
  };

  toggleEditingState = isNameBeingEdited => {
    this.setState({ isNameBeingEdited });
  };

  triggerEditName = () => {
    this.viewEditNameRef.activateEditMode();
  };

  editNodePoolName = name => {
    const { cluster, nodePool } = this.props;

    // Early return in case the name is not changed.
    if (nodePool.name === name) return;

    return new Promise((resolve, reject) => {
      this.props
        .dispatch(nodePoolPatch(cluster.id, nodePool, { name }))
        .then(() => {
          new FlashMessage(
            'Succesfully edited node pool name.',
            messageType.SUCCESS,
            messageTTL.MEDIUM
          );
          resolve();
        })
        .catch(error => {
          console.error(error);
          reject(error);
        });
    });
  };

  deleteNodePool = () => {
    this.props.dispatch(
      this.props.nodePoolActions.nodePoolDelete(
        this.props.cluster.id,
        this.props.nodePool
      )
    );
  };

  showNodePoolScalingModal = nodePool => {
    this.scaleNodePoolModal.reset();
    this.scaleNodePoolModal.show();
    this.scaleNodePoolModal.setNodePool(nodePool);
  };

  render() {
    if (!this.props.nodePool) {
      return <img className='loader' src={spinner} />;
    } else {
      const { availableZonesGridTemplateAreas, cluster, nodePool } = this.props;
      const { id, scaling, availability_zones, status, node_spec } = nodePool;
      const { nodes_ready: current, nodes: desired } = status;
      const { isNameBeingEdited } = this.state;

      return (
        <>
          <Code data-testid='node-pool-id'>{id}</Code>
          {/* Applying style here because is super specific for this element and can't use nth-child with emotion */}
          <div
            style={{
              paddingLeft: '8px',
              justifySelf: 'left',
              gridColumn: isNameBeingEdited ? '2 / 9' : null,
            }}
          >
            <ViewAndEditName
              cssClass='np'
              entity={nodePool}
              entityType='node pool'
              onSubmit={this.editNodePoolName}
              ref={viewEditName => (this.viewEditNameRef = viewEditName)}
              toggleEditingState={this.toggleEditingState}
            />
          </div>
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
              <NodesWrapper data-testid='scaling-min'>
                {scaling.min}
              </NodesWrapper>
              <NodesWrapper data-testid='scaling-max'>
                {scaling.max}
              </NodesWrapper>
              <NodesWrapper>{desired}</NodesWrapper>
              <NodesWrapper
                style={{
                  background:
                    current < desired ? theme.colors.goldBackground : null,
                }}
              >
                {current}
              </NodesWrapper>
              {/* Applying style here because is super specific for this element and can't use nth-child with emotion */}
              <NodePoolDropdownMenu
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
            ref={s => {
              this.scaleNodePoolModal = s;
            }}
            workerNodesDesired={desired}
            workerNodesRunning={current}
          />
        </>
      );
    }
  }
}

NodePool.propTypes = {
  availableZonesGridTemplateAreas: PropTypes.string,
  cluster: PropTypes.object,
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
  nodePoolActions: PropTypes.object,
  dispatch: PropTypes.func,
  provider: PropTypes.string,
};

function mapStateToProps(state, ownProps) {
  return {
    nodePool: state.entities.nodePools.items[ownProps.nodePool.id],
  };
}

function mapDispatchToProps(dispatch) {
  return {
    nodePoolActions: bindActionCreators(nodePoolActions, dispatch),
    dispatch,
  };
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NodePool);
