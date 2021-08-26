import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  border-left: 6px solid ${({ theme }) => theme.colors.dropdownBackground};
  padding: 0px 25px;
  font-style: normal;
  margin: 25px 0px;
  color: ${({ theme }) => theme.colors.darkBlueLighter6};
`;

const Aside = ({ children }) => {
  return (
    <Wrapper>
      <p>{children}</p>
    </Wrapper>
  );
};

export default Aside;
