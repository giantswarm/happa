import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const Text = styled.div<{ loggedIn: boolean }>`
  margin-right: 14px;
  color: ${({ loggedIn, theme }) =>
    loggedIn ? theme.colors.white3 : theme.colors.error};
`;

interface ICPLoginStatusTextProps {
  email?: string;
}

const CPLoginStatusText: React.FC<ICPLoginStatusTextProps> = ({ email }) => {
  const isLoggedIn = typeof email !== 'undefined';

  return (
    <Text loggedIn={isLoggedIn}>
      {isLoggedIn ? (
        <>
          You are logged in as <code>{email}</code>
        </>
      ) : (
        <>You are not logged in.</>
      )}
    </Text>
  );
};

CPLoginStatusText.propTypes = {
  email: PropTypes.string,
};

export default CPLoginStatusText;
