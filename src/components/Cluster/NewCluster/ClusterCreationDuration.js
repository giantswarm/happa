import React from 'react';
import styled from 'styled-components';

const Message = styled.p`
  margin-top: ${({ theme }) => theme.spacingPx * 8}px;
  font-size: 14px;
`;

const ClusterCreationDuration = (props) => {
  // eslint-disable-next-line no-magic-numbers
  const minutes = props.stats.p75 ? Math.round(props.stats.p75 / 60.0) : 0;

  const message =
    minutes > 0
      ? `Most clusters are up within ${minutes} minutes once this form has been
    submitted.`
      : `Clusters usually take between 10 and 30 minutes to come up.`;

  return <Message>{message}</Message>;
};

export default ClusterCreationDuration;
