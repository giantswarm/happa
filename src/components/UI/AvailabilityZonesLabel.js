import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

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
  margin-left: 4px;
  margin-right: 4px;
  line-height: 1.4em;
  text-decoration: none;
  font-weight: 400;
  user-select: none;
  &.a {
    background-color: #66c2a5;
  }
  &.b {
    background-color: #fc8d62;
  }
  &.c {
    background-color: #8da0cb;
  }
  &.d {
    background-color: #e78ac3;
  }
  &.e {
    background-color: #a6d854;
  }
  &.f {
    background-color: #ffd92f;
  }
  &.g {
    background-color: #e5c494;
  }
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
  letter,
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
  const classNames = `${letter} ${notCheckedClass} ${pointerClass} ${isMaxReachedClass}`;

  return (
    <Wrapper
      className={classNames}
      title={title}
      onClick={
        isMaxReached && !isChecked && !isRadioButtons
          ? null
          : () => onToggleChecked(!isChecked, { title, letter, label })
      }
    >
      {label}
    </Wrapper>
  );
}

AvailabilityZonesLabel.propTypes = {
  label: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
  onToggleChecked: PropTypes.func,
  isChecked: PropTypes.bool,
  isMaxReached: PropTypes.bool,
  isRadioButtons: PropTypes.bool,
};

export default AvailabilityZonesLabel;
