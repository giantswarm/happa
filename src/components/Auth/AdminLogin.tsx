import { spinner } from 'images';
import { clearQueues } from 'lib/flashMessage';
import MapiAuth, { MapiAuthConnectors } from 'lib/MapiAuth/MapiAuth';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as mainActions from 'stores/main/actions';
import { getLoggedInUser } from 'stores/main/selectors';

import { useAuthProvider } from './MAPI/MapiAuthProvider';

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
      <div className='login_form--mask' />

      <div className='login_form--container login_form--admin'>
        <img className='loader' src={spinner} />
        <p>
          Verifying credentials, and redirecting to our authentication provider
          if necessary.
        </p>
        <p>If nothing happens please let us know in #support.</p>
      </div>
    </>
  );
};

AdminLogin.propTypes = {};

export default AdminLogin;
