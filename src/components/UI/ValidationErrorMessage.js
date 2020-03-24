import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const MessageSpan = styled.span`
  color: ${props => props.theme.colors.error};
  display: block;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  position: absolute;
  margin-top: -2px;
`;

const ValidationErrorMessage = ({ message }) => (
  <MessageSpan>{message}</MessageSpan>
);

ValidationErrorMessage.propTypes = {
  message: PropTypes.string,
};

export default ValidationErrorMessage;
