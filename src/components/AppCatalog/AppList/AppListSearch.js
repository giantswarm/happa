import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import TextInput from 'UI/Inputs/TextInput';

const Form = styled('form')`
  width: 300px;
  font-size: 14px;
  position: relative;
`;

const SearchIcon = styled.i`
  font-size: 16px;
  color: ${(props) => props.theme.colors.white3};
`;

const ClearLink = styled('a')`
  position: absolute;
  right: 10px;
  top: 3px;
`;

const ClearIcon = styled('i')`
  color: ${(props) => props.theme.colors.white1};
  font-size: 13px;
  font-weight: 800;
`;

const AppListSearch = ({ value, ...props }) => (
  <Form onSubmit={(e) => e.preventDefault()}>
    <TextInput
      icon={<SearchIcon className='fa fa-search' />}
      onChange={props.onChange}
      value={value}
      size='medium'
    />
    {value && (
      <ClearLink onClick={props.onReset}>
        <ClearIcon className='fa fa-close' />
      </ClearLink>
    )}
  </Form>
);

AppListSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
};

export default AppListSearch;
