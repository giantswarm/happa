import { spinner } from 'images';
import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
`;

const Wrapper = styled.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  animation: ${fadeIn} 200ms ease-out 300ms 1 forwards;
`;

const UseCasesPreloader: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <img className='loader' src={spinner} />
    </Wrapper>
  );
};

export default UseCasesPreloader;
