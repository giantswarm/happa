import React from 'react';
import ReleaseComponentLabel from './release_component_label';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  h2 {
    font-size: 22px;
    margin-bottom: 20px;
  }
  p {
    margin-bottom: 20px;
  }
`;

const StyleGuide = () => {
  return (
    <Wrapper className='main col-9'>
      <h1>Style Guide</h1>

      <hr />

      <h2 id='ReleaseComponentLabel'>ReleaseComponentLabel</h2>

      <p>
        Displays a release component&apos;s version number or the change of a
        version number in an upgrade.
      </p>

      <div>
        <ReleaseComponentLabel version='3.1.5' />
        <ReleaseComponentLabel name='calico' version='3.1.5' />
        <ReleaseComponentLabel
          name='kubernetes'
          oldVersion='1.14.1'
          version='1.13.3'
        />
        <ReleaseComponentLabel isRemoved={true} name='outphased' />
        <ReleaseComponentLabel isAdded={true} name='newbie' version='0.0.1' />
      </div>
    </Wrapper>
  );
};

export default StyleGuide;
