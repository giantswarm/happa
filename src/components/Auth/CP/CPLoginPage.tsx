import styled from '@emotion/styled';
import CPLoginButton from 'Auth/CP/CPLoginButton';
import CPLoginStatusText from 'Auth/CP/CPLoginStatusText';
import CPAuth from 'lib/CPAuth/CPAuth';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import React, { useCallback, useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { OtherRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { getCPAuthUser } from 'stores/cpauth/selectors';

const CPStatus = styled.div`
  margin-top: ${({ theme }) => theme.spacingPx * 8}px;
  display: flex;
  align-items: center;
`;

interface ICPLoginPageProps {}

const CPLoginPage: React.FC<ICPLoginPageProps> = () => {
  const dispatch = useDispatch();

  const user = useSelector(getCPAuthUser);
  const isLoggedIn = user !== null;

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const auth = CPAuth.getInstance();
        if (isLoggedIn) {
          await auth.logout();
          // Force a reload, so we could re-run the batched actions.
          window.location.href = OtherRoutes.Home;
        } else {
          await auth.attemptLogin();
        }
      } catch (err) {
        new FlashMessage(err.message, messageType.ERROR, messageTTL.MEDIUM);
      }
    },
    [isLoggedIn]
  );

  useEffect(() => {
    const currentURL = window.location.href;

    if (currentURL.includes(OtherRoutes.CPAccessCallback)) {
      const handleAuthParams = async () => {
        try {
          const auth = CPAuth.getInstance();
          await auth.handleLoginResponse(currentURL);

          // Force a reload, so we could re-run the batched actions.
          window.location.href = OtherRoutes.Home;
        } catch (err) {
          new FlashMessage(err.message, messageType.ERROR, messageTTL.MEDIUM);
        }
      };

      handleAuthParams();
    }
  }, [dispatch]);

  return (
    <Breadcrumb
      data={{
        title: 'Control Plane Access'.toUpperCase(),
        pathname: OtherRoutes.CPAccess,
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
          <CPLoginButton isLoggedIn={isLoggedIn} onClick={handleClick} />
        </CPStatus>
      </DocumentTitle>
    </Breadcrumb>
  );
};

CPLoginPage.propTypes = {};

export default CPLoginPage;
