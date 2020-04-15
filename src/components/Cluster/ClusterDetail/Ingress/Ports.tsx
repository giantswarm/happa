import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const List = styled.ul`
  padding-left: 0;
  list-style: none;
`;

const Label = styled.span`
  display: inline-block;
  width: 3rem;
  margin-right: 1rem;
`;

interface IPortsProps extends React.ComponentPropsWithoutRef<'ul'> {
  HTTP?: number;
  HTTPS?: number;
}

const Ports: React.FC<IPortsProps> = ({ HTTP, HTTPS, ...rest }) => {
  return (
    <List {...rest}>
      <li>
        <Label>HTTP:</Label>
        {HTTP}
      </li>
      <li>
        <Label>HTTPS:</Label>
        {HTTPS}
      </li>
    </List>
  );
};

Ports.propTypes = {
  HTTP: PropTypes.number,
  HTTPS: PropTypes.number,
};

Ports.defaultProps = {
  HTTP: 0,
  HTTPS: 0,
};

export default Ports;
