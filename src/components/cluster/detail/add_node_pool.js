import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import styled from '@emotion/styled';
import theme from 'styles/theme';

const FlexColumn = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

class AddNodePool extends Component {
  state = {
    isNameBeingEdited: false,
  };

  render() {
    return (
      <>
        <h3 className='table-label'>Add Node Pool</h3>
        <FlexColumn>
          <label htmlFor='name'>
            Name
            <input id='name' type='text'></input>
          </label>
          <label htmlFor='instance-type'>
            Instance type
            <select in='instance-type'>
              <option value='1'>Value 1</option>
              <option value='2'>Value 2</option>
            </select>
            <p>2 CPU cores, 8GB RAM each</p>
          </label>
          <label htmlFor='availability-zones'>
            Availability Zones
            <input
              type='number'
              name='availability-zones'
              id='availability-zones'
            />
            <p>or Select distinct availability zones</p>
          </label>
        </FlexColumn>
      </>
    );
  }
}

AddNodePool.propTypes = {};

export default AddNodePool;
