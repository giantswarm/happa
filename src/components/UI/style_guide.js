import React from 'react';
import ReleaseComponentLabel from './release_component_label';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  h2 {
    font-size: 22px;
    margin-bottom: 20px;
  }
`;

const StyleGuide = () => {
  return (
    <Wrapper className='main col-9'>
      <h1>Style Guide</h1>

      <h2>ReleaseComponentLabel</h2>

      <ReleaseComponentLabel version='1.2.3' />
    </Wrapper>
  );
};

export default StyleGuide;
