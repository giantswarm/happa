import { Wrapper } from './availability_zones_label';
import PropTypes from 'prop-types';
import React from 'react';

function AvailabilityZonesLabelRadio({
  label,
  letter,
  title,
  onToggleChecked,
  isChecked,
}) {
  const classNames = `${
    onToggleChecked && !isChecked ? `not-checked ${letter}` : letter
    /* If this has onToggleChecked prop it means that it is clickable and hence we don't want a "?" as cursor */
  } ${onToggleChecked && 'pointer'}`;

  return (
    <Wrapper
      className={classNames}
      title={title}
      onClick={() => onToggleChecked(!isChecked, { title, letter, label })}
    >
      {label}
    </Wrapper>
  );
}

AvailabilityZonesLabelRadio.propTypes = {
  label: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
  onToggleChecked: PropTypes.func,
  isChecked: PropTypes.bool,
};

export default AvailabilityZonesLabelRadio;
