import styled from '@emotion/styled';
import CPLoginButton from 'Auth/CP/CPLoginButton';
import CPLoginStatusText from 'Auth/CP/CPLoginStatusText';
import { replace } from 'connected-react-router';
import CPAuth from 'lib/CPAuth';
import React, { useCallback, useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { AppRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { getCPAuthUser } from 'stores/cpauth/selectors';

const CPStatus = styled.div`
  margin-top: 32px;
  max-width: 1024px;
  display: flex;
  align-items: center;
`;

interface ICPLoginPageProps {}

const CPLoginPage: React.FC<ICPLoginPageProps> = () => {
  const dispatch = useDispatch();

  const handleLogin = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const auth = CPAuth.getInstance();
        await auth.attemptLogin();
      } catch (err) {
        console.log(err);
      }
    },
    []
  );

  useEffect(() => {
    const currentURL = window.location.href;

    if (currentURL.includes(AppRoutes.CPAccessCallback)) {
      const handleAuthParams = async () => {
        try {
          const auth = CPAuth.getInstance();
          await auth.handleLoginResponse(currentURL);

          dispatch(replace(AppRoutes.CPAccess));
        } catch (err) {
          console.log(err);
        }
      };

      handleAuthParams();
    }
  }, [dispatch]);

  const user = useSelector(getCPAuthUser);

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
          <CPLoginStatusText email={user?.email} />
          <CPLoginButton onClick={handleLogin} />
        </CPStatus>
      </DocumentTitle>
    </Breadcrumb>
  );
};

CPLoginPage.propTypes = {};

export default CPLoginPage;
