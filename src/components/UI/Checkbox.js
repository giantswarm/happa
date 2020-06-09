import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const CheckboxWrapper = styled.span`
  cursor: pointer;
`;

const FaCheckBoxIcon = styled.i`
  font-size: 16px;
`;

const CheckboxLabel = styled.span`
  margin-left: 5px;
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
