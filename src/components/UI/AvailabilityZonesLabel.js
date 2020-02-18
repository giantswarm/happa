import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const azColors = [
  '#66c2a5',
  '#fc8d62',
  '#8da0cb',
  '#e78ac3',
  '#a6d854',
  '#ffd92f',
  '#e5c494',
];

const getLetterIndexInAlphabet = letter => {
  const firstAlphabetLetterCode = 97;
  const letterCode = letter.toLowerCase().charCodeAt(0);
  const letterIndex = letterCode - firstAlphabetLetterCode;

  return letterIndex;
};

const getColorIndex = value => {
  let valueAsNumber = Number(value);

  if (isNaN(valueAsNumber)) {
    return getLetterIndexInAlphabet(value);
  }

  // Make index start from 0
  valueAsNumber--;

  return valueAsNumber;
};

/**
 * This component displays availability zone labels
 * for the zones used by a cluster or node pool.
 *
 * Each zone gets a unique color for visual distinction.
 */
const Wrapper = styled.abbr`
  border-radius: 2em;
  color: #333;
  padding: 2px;
  display: inline-block;
  width: 1.6em;
  text-align: center;
  margin-right: 8px;
  line-height: 1.4em;
  text-decoration: none;
  font-weight: 400;
  user-select: none;
  background-color: ${({ bgColor }) => bgColor};

  &[title] {
    text-decoration: none;
  }

  /* This is just for node pool creation form */
  &.not-checked {
    background-color: #567;
    color: #eee;
    transition: all 0.3s;

    &.is-max-reached {
      background-color: #25495d;
      color: #aaa;
    }
  }

  &.pointer {
    cursor: pointer !important; /* It is a pain to override bootstrap styles. */
  }

  &.pointer-disabled {
    cursor: default !important;
  }
`;

function AvailabilityZonesLabel({
  label,
  value,
  title,
  onToggleChecked,
  isChecked,
  isMaxReached,
  isRadioButtons,
}) {
  const notCheckedClass = onToggleChecked && !isChecked ? `not-checked` : '';
  /* If this has onToggleChecked prop it means that it is clickable and hence we don't want a "?" as cursor */
  const pointerClass =
    onToggleChecked && isMaxReached && !isChecked && !isRadioButtons
      ? 'pointer-disabled'
      : onToggleChecked
      ? 'pointer'
      : '';

  const isMaxReachedClass =
    isMaxReached && !isRadioButtons ? 'is-max-reached' : '';
  const classNames = `${notCheckedClass} ${pointerClass} ${isMaxReachedClass}`;

  const colorIndex = getColorIndex(value);
  const color = azColors[colorIndex];

  const toggleChecked = () => {
    if (!isMaxReached || isChecked || isRadioButtons) {
      onToggleChecked(!isChecked, { title, value, label });
    }
  };

  return (
    <Wrapper
      className={classNames}
      title={title}
      bgColor={color}
      onClick={toggleChecked}
    >
      {label}
    </Wrapper>
  );
}

AvailabilityZonesLabel.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  title: PropTypes.string,
  onToggleChecked: PropTypes.func,
  isChecked: PropTypes.bool,
  isMaxReached: PropTypes.bool,
  isRadioButtons: PropTypes.bool,
};

export default AvailabilityZonesLabel;
