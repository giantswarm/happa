import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Wrapper = styled.div`
  border-left: 6px solid #2a5874;
  padding: 0px 25px;
  font-style: normal;
  margin: 25px 0px;
  color: #a5b3bb;
`;

const Aside = ({ children }) => {
  return (
    <Wrapper>
      <p>{children}</p>
    </Wrapper>
  );
};

Aside.propTypes = {
  children: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default Aside;
