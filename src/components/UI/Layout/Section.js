import { CSSBreakpoints } from 'model/constants';
import React from 'react';
import styled from 'styled-components';
import { mq } from 'styles';

const Wrapper = styled.div`
  border-top: 1px solid #3a5f7b;
  margin-bottom: 25px;
  margin-top: 25px;
  padding-top: 25px;
  display: flex;

  flex-direction: ${({ flat }) => (flat ? 'column' : 'row')};

  ${mq(CSSBreakpoints.Medium)} {
    flex-direction: column;
  }
`;

const Left = styled.div`
  width: ${({ flat }) => (flat ? '100%' : '25%')};

  ${mq(CSSBreakpoints.Medium)} {
    width: 100%;
  }
`;

const Right = styled.div`
  width: ${({ flat }) => (flat ? '100%' : '85%')};

  ${mq(CSSBreakpoints.Medium)} {
    width: 100%;
  }
`;

const Section = ({ flat, title, children, ...rest }) => {
  return (
    <Wrapper flat={flat} {...rest}>
      <Left flat={flat}>
        <h3 className='table-label'>{title}</h3>
      </Left>
      <Right flat={flat}>{children}</Right>
    </Wrapper>
  );
};

export default Section;
