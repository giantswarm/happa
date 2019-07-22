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

const AvailabilityZonesLabel = ({ key, label, letter, title }) => (
  <Wrapper className={letter} key={key} title={title}>
    {label}
  </Wrapper>
);

AvailabilityZonesLabel.propTypes = {
  key: PropTypes.string,
  label: PropTypes.string,
  letter: PropTypes.string,
  title: PropTypes.string,
};

export default AvailabilityZonesLabel;
