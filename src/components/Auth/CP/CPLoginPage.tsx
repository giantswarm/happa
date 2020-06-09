import styled from '@emotion/styled';
import CPLoginButton from 'Auth/CP/CPLoginButton';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { AppRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';

const CPStatus = styled.div`
  margin-top: 32px;
  max-width: 1024px;
  display: flex;
  align-items: center;
`;

const CPStatusText = styled.div<{ loggedIn: boolean }>`
  margin-right: 14px;
  color: ${({ loggedIn, theme }) =>
    loggedIn ? theme.colors.greenNew : theme.colors.error};
`;

interface ICPLoginPageProps {}

const CPLoginPage: React.FC<ICPLoginPageProps> = () => {
  return (
    <Breadcrumb
      data={{
        title: 'Control Plane Access'.toUpperCase(),
        pathname: AppRoutes.CPAccess,
      }}
    >
      <DocumentTitle title='Control Plane Access'>
        <h1>Control Plane Access</h1>
        <p>
          In order to have access to the Control Plane API, you must be logged
          in.
        </p>
        <CPStatus>
          <CPStatusText loggedIn={false}>You are not logged in.</CPStatusText>
          <CPLoginButton />
        </CPStatus>
      </DocumentTitle>
    </Breadcrumb>
  );
};

CPLoginPage.propTypes = {};

export default CPLoginPage;
