import { spinner } from 'images';
import { clearQueues } from 'lib/flashMessage';
import MapiAuth, { MapiAuthConnectors } from 'lib/MapiAuth/MapiAuth';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ShadowMask from 'shared/ShadowMask';
import * as mainActions from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';
import styled from 'styled-components';

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

const AdminLogin: React.FC<IAdminLoginProps> = () => {
  const user = useSelector(getLoggedInUser);
  const auth = useAuthProvider();
  const dispatch = useDispatch();

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

AdminLogin.propTypes = {};

export default AdminLogin;
