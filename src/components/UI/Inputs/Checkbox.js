import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';

const CheckboxWrapper = styled.span`
  cursor: pointer;
  display: flex;
  align-items: center;
`;

const FaCheckBoxIcon = styled.i`
  font-size: 16px;
`;

const CheckboxLabel = styled.span`
  margin-left: 5px;
  display: flex;
  align-items: center;
`;

const Checkbox = ({ checked, label, onChange }) => {
  return (
    <CheckboxWrapper onClick={() => onChange(!checked)}>
      <FaCheckBoxIcon
        className={`fa fa-${checked ? 'checkbox-marked' : 'checkbox-blank'}`}
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

Checkbox.defaultProps = {
  /* eslint-disable-next-line no-empty-function */
  onChange: () => {},
};

export default Checkbox;
