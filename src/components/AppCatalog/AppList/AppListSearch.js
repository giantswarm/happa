import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Form = styled('form')`
  width: 300px;
  font-size: 14px;
  position: relative;

  input {
    padding: 8px 10px;
  }

  a {
    position: absolute;
    right: -3px;
    top: -8px;
  }

  i {
    color: #fff;
    font-size: 13px;
    font-weight: 800;
  }
`;

const AppListSearch = ({ value, ...props }) => (
  <Form>
    <div className='input-with-icon'>
      <i className='fa fa-search' />
      <input onChange={props.onChange} type='text' value={value} />
      {value && (
        <a onClick={props.onReset}>
          <i className='fa fa-close' />
        </a>
      )}
    </div>
  </Form>
);

AppListSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
};

export default AppListSearch;
