import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Form = styled('form')`
  width: 300px;
  font-size: 14px;
  position: relative;
`;

const InputWithIcon = styled('div')`
  display: flex;
  align-items: stretch;
`;

const SearchIcon = styled('i')`
  font-size: 24px;
  position: relative;
  top: 6px;
  margin-right: 4px;
  color: ${(props) => props.theme.colors.white3};
`;

const Input = styled('input')`
  padding: 8px 10px !important;
  margin-bottom: 0px !important;
`;

const ClearLink = styled('a')`
  position: absolute;
  right: 10px;
  top: -1px;
`;

const ClearIcon = styled('i')`
  color: ${(props) => props.theme.colors.white1};
  font-size: 13px;
  font-weight: 800;
`;

const AppListSearch = ({ value, ...props }) => (
  <Form onSubmit={(e) => e.preventDefault()}>
    <InputWithIcon>
      <SearchIcon className='fa fa-search' />
      <Input onChange={props.onChange} type='text' value={value} />
      {value && (
        <ClearLink onClick={props.onReset}>
          <ClearIcon className='fa fa-close' />
        </ClearLink>
      )}
    </InputWithIcon>
  </Form>
);

AppListSearch.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onReset: PropTypes.func,
};

export default AppListSearch;
