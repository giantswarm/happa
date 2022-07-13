import { Keyboard } from 'grommet';
import { RUMActions } from 'model/constants/realUserMonitoring';
import React, { KeyboardEvent } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';

const azColors = [
  '#66c2a5',
  '#fc8d62',
  '#8da0cb',
  '#e78ac3',
  '#a6d854',
  '#ffd92f',
  '#e5c494',
];

const getLetterIndexInAlphabet = (letter: string) => {
  const firstAlphabetLetterCode = 97;
  const letterCode = letter.toLowerCase().charCodeAt(0);
  const letterIndex = letterCode - firstAlphabetLetterCode;

  return letterIndex;
};

const getColorIndex = (value: string) => {
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
const Wrapper = styled.abbr<{ bgColor: string }>`
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

interface IAvailabilityZonesLabelProps {
  label: string;
  value: string;
  title: string;
  onToggleChecked?: (
    isChecked: boolean,
    payload: {
      title: string;
      value: string;
      label: string;
    }
  ) => {};
  isChecked: boolean;
  isMaxReached?: boolean;
  isRadioButtons?: boolean;
}

const AvailabilityZonesLabel: React.FC<IAvailabilityZonesLabelProps> = ({
  label,
  value,
  title,
  onToggleChecked,
  isChecked,
  isMaxReached,
  isRadioButtons,
}) => {
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
    // This component is used in forms, where we do pass an onToggleChecked function
    // to change form state, and in cluster details view where we do not need to
    // perform any action onClick.
    // We only want to return onToggleChecked if it is passed.
    if ((!isMaxReached || isChecked || isRadioButtons) && onToggleChecked) {
      onToggleChecked(!isChecked, { title, value, label });
    }
  };

  const handleSelectKeyDown = (e: KeyboardEvent) => {
    e.preventDefault();

    toggleChecked();
  };

  return (
    <RUMActionTarget name={RUMActions.ToggleAZ}>
      <Keyboard onSpace={handleSelectKeyDown} onEnter={handleSelectKeyDown}>
        <Wrapper
          className={classNames}
          title={title}
          bgColor={color}
          onClick={toggleChecked}
          tabIndex={0}
          aria-label={`Availability zone ${value}`}
        >
          {label}
        </Wrapper>
      </Keyboard>
    </RUMActionTarget>
  );
};

export default AvailabilityZonesLabel;
