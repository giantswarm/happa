import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const CheckboxWrapper = styled.div``;

const CheckboxLabel = styled.span`
  margin-left: 5px;
`;

/* eslint-disable-next-line no-empty-function */
const Checkbox = ({ checked, label, onChange = () => {} }) => {
  return (
    <CheckboxWrapper onClick={() => onChange(!checked)}>
      <i
        className={`fa fa-${checked ? 'check-box' : 'check-box-outline-blank'}`}
      />
      <CheckboxLabel className='checkbox-label'>{label}</CheckboxLabel>
    </CheckboxWrapper>
  );
};

Checkbox.propTypes = {
  checked: PropTypes.bool,
  label: PropTypes.node,
  onChange: PropTypes.func,
};

export default Checkbox;
