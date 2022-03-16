import { spinner } from 'images';
import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClusterListPreloader: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <img className='loader' src={spinner} />
    </Wrapper>
  );
};

export default ClusterListPreloader;
