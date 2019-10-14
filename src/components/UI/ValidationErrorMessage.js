import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const MessageSpan = styled.span`
  color: ${props => props.theme.colors.error};
  display: block;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  position: absolute;
`;

const ValidationErrorMessage = ({ message }) => (
  <MessageSpan>{message}</MessageSpan>
);

ValidationErrorMessage.propTypes = {
  message: PropTypes.string,
};

export default ValidationErrorMessage;
