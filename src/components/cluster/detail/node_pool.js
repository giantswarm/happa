import { Code } from 'styles/';
import { connect } from 'react-redux';
import { FlashMessage, messageTTL, messageType } from 'lib/flash_message';
import { nodePoolPatch } from 'actions/nodePoolsActions';
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
    return new Promise((resolve, reject) => {
      this.props
        .dispatch(nodePoolPatch(this.props.nodePool, { name: value }))
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
    const { availableZonesGridTemplateAreas, nodePool } = this.props;

    const { id, scaling, availability_zones, status, node_spec } = nodePool;

    const { nodes_ready: current, nodes: desired } = status;

    const { isNameBeingEdited } = this.state;

    return (
      <>
        <Code>{id}</Code>
        <div
          style={{
            paddingLeft: '8px',
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
        {/* Hide the rest of field when editing name */}
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
            <NodesWrapper>{scaling.Min}</NodesWrapper>
            <NodesWrapper>{scaling.Max}</NodesWrapper>
            <NodesWrapper>{desired}</NodesWrapper>
            <NodesWrapper
              style={{
                background:
                  current < desired ? theme.colors.goldBackground : null,
              }}
            >
              {current}
            </NodesWrapper>
            <NodePoolDropdownMenu triggerEditName={this.triggerEditName} />
          </>
        )}
      </>
    );
  }
}

NodePool.propTypes = {
  availableZonesGridTemplateAreas: PropTypes.string,
  nodePool: PropTypes.shape({
    availability_zones: PropTypes.array,
    id: PropTypes.string,
    name: PropTypes.string,
    node_spec: PropTypes.object,
    scaling: PropTypes.shape({
      Min: PropTypes.number,
      Max: PropTypes.number,
    }),
    status: PropTypes.shape({
      nodes: PropTypes.number,
      nodes_ready: PropTypes.number,
    }),
  }),
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    dispatch: dispatch,
  };
}

export default connect(
  undefined,
  mapDispatchToProps
)(NodePool);
