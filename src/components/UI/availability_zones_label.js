import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
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
  font-size: 400;
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
`;

function AvailabilityZonesLabel({ label, letter, title, onToggleChecked }) {
  const [checked, setChecked] = useState(false);
  const firstUpdate = useRef(true);

  const toggleChecked = () => {
    console.log('why?');
    setChecked(state => !state);
  };

  useEffect(() => {
    // We dont want this to run on first render
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }

    if (onToggleChecked) {
      console.log('toggle checked!', checked);
      onToggleChecked(checked, { title, letter, label });
    }
  }, [checked]);

  return (
    <Wrapper className={letter} title={title} onClick={toggleChecked}>
      {label}
    </Wrapper>
  );
}

AvailabilityZonesLabel.propTypes = {
  label: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
  onToggleChecked: PropTypes.func,
};

export default AvailabilityZonesLabel;
