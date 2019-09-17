import { connect } from 'react-redux';
import AWSInstanceTypeSelector from '../new/aws_instance_type_selector';
import Button from 'UI/button';
import NumberPicker from 'UI/number_picker';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import theme from 'styles/theme';

const Wrapper = styled.div`
  background-color: ${props => props.theme.colors.shade10};
  padding: 20px;
  border-radius: 5px;
`;

const FlexColumn = styled.form`
  display: flex;
  justify-content: space-between;
  /* align-items: flex-start; */
  flex-direction: column;
  margin: 0 auto;
  max-width: 600px;
  label {
    display: flex;
    justify-content: space-between;
    flex-direction: column;
  }
  .label-span {
    font-size: 16px;
    color: ${props => props.theme.colors.white1};
    margin-top: 31px;
  }
  .label-span,
  input,
  select {
    margin-bottom: 13px;
    font-weight: 400;
  }
  p {
    line-height: 1.3;
  }
`;

class AddNodePool extends Component {
  state = {
    isNameBeingEdited: false,
  };

  render() {
    return (
      <Wrapper>
        <h3 className='table-label'>Add Node Pool</h3>
        <FlexColumn>
          <label htmlFor='name'>
            <span className='label-span'>Name</span>
            <input id='name' type='text'></input>
          </label>
          <p>
            Pick a name that helps team mates to understand what these nodes are
            here for. You can change this later. Each pool also gets a unique
            identifier.
          </p>
          <label htmlFor='instance-type'>
            <span className='label-span'>Instance type</span>
            <AWSInstanceTypeSelector
              // allowedInstanceTypes={this.props.allowedInstanceTypes}
              allowedInstanceTypes={['m3.large', 'm5.large']}
              // onChange={this.updateAWSInstanceType}
              readOnly={false}
              // value={this.state.aws.instanceType.value}
              value='m3.large'
            />
            <p>2 CPU cores, 8GB RAM each</p>
          </label>
          <label htmlFor='availability-zones'>
            <span className='label-span'>Availability Zones</span>
            <input
              id='availability-zones'
              name='availability-zones'
              type='number'
            />
            <p>or Select distinct availability zones</p>
          </label>
          <p>
            Covering one availability zone, the worker nodes of this node pool
            will be placed in the same availability zones as the cluster&apos;s
            master node.
          </p>
          <div>Scaling range</div>
          <label htmlFor='scaling-range-min'>
            <span className='label-span'>Availability Zones</span>
            <input
              id='scaling-range-min'
              name='scaling-range-min'
              type='number'
            />
          </label>
          <label htmlFor='scaling-range-max'>
            Availability Zones
            <NumberPicker
              label=''
              max={this.props.maxAvailabilityZones}
              min={this.props.minAvailabilityZones}
              // onChange={this.updateAvailabilityZonesPicker}
              readOnly={false}
              stepSize={1}
              // value={this.state.availabilityZonesPicker.value}
              value={3}
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
        </FlexColumn>
      </Wrapper>
    );
  }
}

AddNodePool.propTypes = {
  maxAvailabilityZones: PropTypes.number,
  minAvailabilityZones: PropTypes.number,
};

export default AddNodePool;
