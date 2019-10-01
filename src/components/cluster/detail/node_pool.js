import * as nodePoolActions from 'actions/nodePoolActions';
import { bindActionCreators } from 'redux';
import { Code } from 'styles/';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { nodePoolPatch } from 'actions/nodePoolActions';
import AvailabilityZonesWrapper from './availability_zones_wrapper';
import NodePoolDropdownMenu from './node_pool_dropdown_menu';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
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

  toggleEditingState = isNameBeingEdited =>
    this.setState({ isNameBeingEdited });

  triggerEditName = () => this.viewEditNameRef.activateEditMode();

  editNodePoolName = value => {
    const { clusterId, nodePool } = this.props;

    return new Promise((resolve, reject) => {
      this.props
        .dispatch(nodePoolPatch(clusterId, nodePool, { name: value }))
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

  render() {
    const {
      availableZonesGridTemplateAreas,
      clusterId,
      nodePool,
      showNodePoolScalingModal,
    } = this.props;

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
            <NodesWrapper>{scaling.min}</NodesWrapper>
            <NodesWrapper>{scaling.max}</NodesWrapper>
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
              clusterId={clusterId}
              nodePool={nodePool}
              nodePoolDelete={this.props.nodePoolActions.nodePoolDelete}
              showNodePoolScalingModal={showNodePoolScalingModal}
              triggerEditName={this.triggerEditName}
            />
          </>
        )}
      </>
    );
  }
}

NodePool.propTypes = {
  availableZonesGridTemplateAreas: PropTypes.string,
  clusterId: PropTypes.string,
  nodePool: PropTypes.shape({
    availability_zones: PropTypes.array,
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
  showNodePoolScalingModal: PropTypes.func,
};

function mapStateToProps(state, ownProps) {
  return {
    nodePool: state.entities.nodePools[ownProps.nodePool.id],
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
