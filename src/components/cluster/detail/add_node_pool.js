import { connect } from 'react-redux';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import Button from 'UI/button';
import NodeCountSelector from 'shared/node_count_selector';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import theme from 'styles/theme';

const WrapperDiv = styled.div`
  background-color: ${props => props.theme.colors.shade10};
  padding: 20px;
  border-radius: 5px;
  h3 {
    margin-bottom: 20px;
  }
`;

const FlexWrapperDiv = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 13px;
`;

const FlexColumnForm = styled.form`
  display: flex;
  justify-content: space-between;
  /* align-items: flex-start; */
  flex-direction: column;
  margin: 0 auto;
  max-width: 650px;
  label {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin: 0 0 31px;
    p {
      line-height: 1.4;
    }
  }
  .label-span {
    color: ${props => props.theme.colors.white1};
  }
  .label-span,
  input,
  select {
    font-size: 16px;
    margin-bottom: 13px;
    font-weight: 400;
  }
  & > input {
    margin-bottom: 13px !important;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: ${props => props.theme.colors.white1};
  }
  /* Overrides for AWSInstanceTypeSelector */
  .textfield label,
  .message {
    display: none;
    margin: 0;
  }
  .textfield,
  .textfield input {
    margin: 0;
  }
  /* Overrides for NumberPicker */
  .availability-zones {
    & > div > div,
    & > div > div > div {
      margin: 0;
    }
  }
`;

class AddNodePool extends Component {
  state = {
    isNameBeingEdited: false,
  };

  render() {
    return (
      <WrapperDiv>
        <h3 className='table-label'>Add Node Pool</h3>
        <FlexColumnForm>
          <label htmlFor='name'>
            <span className='label-span'>Name</span>
            <input id='name' type='text'></input>
            <p>
              Pick a name that helps team mates to understand what these nodes
              are here for. You can change this later. Each pool also gets a
              unique identifier.
            </p>
          </label>
          <label htmlFor='instance-type'>
            <span className='label-span'>Instance type</span>
            <FlexWrapperDiv>
              <AWSInstanceTypeSelector
                // allowedInstanceTypes={this.props.allowedInstanceTypes}
                allowedInstanceTypes={['m3.large', 'm5.large']}
                // onChange={this.updateAWSInstanceType}
                readOnly={false}
                // value={this.state.aws.instanceType.value}
                value='m3.large'
              />
              <p>2 CPU cores, 8GB RAM each</p>
            </FlexWrapperDiv>
          </label>
          <label className='availability-zones' htmlFor='availability-zones'>
            <span className='label-span'>Availability Zones</span>
            <FlexWrapperDiv>
              <NumberPicker
                // label=''
                max={this.props.maxAvailabilityZones}
                min={this.props.minAvailabilityZones}
                // onChange={this.updateAvailabilityZonesPicker}
                readOnly={false}
                stepSize={1}
                // value={this.state.availabilityZonesPicker.value}
                value={3}
              />
              <p>or Select distinct availability zones</p>
            </FlexWrapperDiv>
            <p>
              Covering one availability zone, the worker nodes of this node pool
              will be placed in the same availability zones as the
              cluster&apos;s master node.
            </p>
          </label>
          <label htmlFor='scaling-range-min'>
            <span className='label-span'>Scaling range</span>
            <NodeCountSelector
              // autoscalingEnabled={this.isScalingAutomatic(
              //   this.props.provider,
              //   this.state.releaseVersion
              // )}
              autoscalingEnabled={true}
              // onChange={this.updateScaling}
              readOnly={false}
              // scaling={this.state.scaling}
              scaling={{
                automatic: false,
                min: 3,
                minValid: true,
                max: 3,
                maxValid: true,
              }}
            />
          </label>
          <Button
            bsSize='large'
            bsStyle='primary'
            // disabled={!this.valid()}
            // loading={this.state.submitting}
            // onClick={this.createCluster}
            type='button'
          >
            Create Node Pool
          </Button>
          <Button
            bsSize='large'
            bsStyle='default'
            // disabled={!this.valid()}
            // loading={this.state.submitting}
            // onClick={this.createCluster}
            type='button'
          >
            Cancel
          </Button>
        </FlexColumnForm>
      </WrapperDiv>
    );
  }
}

AddNodePool.propTypes = {
  maxAvailabilityZones: PropTypes.number,
  minAvailabilityZones: PropTypes.number,
};

export default AddNodePool;
