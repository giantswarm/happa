import { spinner } from 'images';
import * as mainActions from 'model/stores/main/actions';
import { getLoggedInUser } from 'model/stores/main/selectors';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dispatch } from 'redux';
import ShadowMask from 'shared/ShadowMask';
import styled from 'styled-components';
import { clearQueues } from 'utils/flashMessage';
import MapiAuth, { MapiAuthConnectors } from 'utils/MapiAuth/MapiAuth';

import { useAuthProvider } from './MAPI/MapiAuthProvider';

const Wrapper = styled.div`
  position: relative;
  margin: auto;
  margin-top: -40px;
  z-index: 1;
  max-width: 400px;
  text-align: center;

  .loader {
    margin-top: 50px;
    margin-bottom: 25px;
  }
`;

interface IAdminLoginProps {}

const AdminLogin: React.FC<React.PropsWithChildren<IAdminLoginProps>> = () => {
  const user = useSelector(getLoggedInUser);
  const auth = useAuthProvider();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch: Dispatch<any> = useDispatch();

  useEffect(() => {
    dispatch(
      mainActions.mapiLogin(auth as MapiAuth, MapiAuthConnectors.GiantSwarm)
    );

    return () => {
      clearQueues();
    };
  }, [dispatch, user, auth]);

  return (
    <>
      <ShadowMask />

      <Wrapper>
        <img className='loader' src={spinner} />
        <p>
          Verifying credentials, and redirecting to our authentication provider
          if necessary.
        </p>
        <p>If nothing happens please let us know in #support.</p>
      </Wrapper>
    </>
  );
};

export default AdminLogin;
