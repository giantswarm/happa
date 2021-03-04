import MapiLoginButton from 'Auth/MAPI/MapiLoginButton';
import MapiLoginStatusText from 'Auth/MAPI/MapiLoginStatusText';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import MapiAuth from 'lib/MapiAuth/MapiAuth';
import React, { useCallback, useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useDispatch, useSelector } from 'react-redux';
import { MainRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { getMapiAuthUser } from 'stores/mapiauth/selectors';
import styled from 'styled-components';

const MapiStatus = styled.div`
  margin-top: ${({ theme }) => theme.spacingPx * 8}px;
  display: flex;
  align-items: center;
`;

interface IMapiLoginPageProps {}

const MapiLoginPage: React.FC<IMapiLoginPageProps> = () => {
  const dispatch = useDispatch();

  const user = useSelector(getMapiAuthUser);
  const isLoggedIn = user !== null;

  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        const auth = MapiAuth.getInstance();
        if (isLoggedIn) {
          await auth.logout();
          // Force a reload, so we could re-run the batched actions.
          window.location.href = MainRoutes.Home;
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

    if (currentURL.includes(MainRoutes.MapiAccessCallback)) {
      const handleAuthParams = async () => {
        try {
          const auth = MapiAuth.getInstance();
          await auth.handleLoginResponse(currentURL);

          // Force a reload, so we could re-run the batched actions.
          window.location.href = MainRoutes.Home;
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
        pathname: MainRoutes.MapiAccess,
      }}
    >
      <DocumentTitle title='Control Plane Access'>
        <h1>Control Plane Access</h1>
        <p>
          In order to have access to the Control Plane API, you must be logged
          in.
        </p>
        <MapiStatus>
          <MapiLoginStatusText email={user?.email} />
          <MapiLoginButton isLoggedIn={isLoggedIn} onClick={handleClick} />
        </MapiStatus>
      </DocumentTitle>
    </Breadcrumb>
  );
};

MapiLoginPage.propTypes = {};

export default MapiLoginPage;
