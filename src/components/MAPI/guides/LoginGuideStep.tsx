import { getK8sAPIUrl } from 'MAPI/utils';
import {
  getIsImpersonatingNonAdmin,
  getUserIsAdmin,
} from 'model/stores/main/selectors';
import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';

interface ILoginGuideStepProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CLIGuideStep>,
    'title' | 'command'
  > {}

const LoginGuideStep: React.FC<
  React.PropsWithChildren<ILoginGuideStepProps>
> = (props) => {
  const providerFlavor = window.config.info.general.providerFlavor;
  const k8sAPIUrl = useRef(getK8sAPIUrl(providerFlavor));

  const isAdmin = useSelector(getUserIsAdmin);
  const isImpersonatingNonAdmin = useSelector(getIsImpersonatingNonAdmin);

  const displayClusterAdminFlag = isAdmin && !isImpersonatingNonAdmin;

  return (
    <CLIGuideStep
      {...props}
      title={`
          1. Make sure you are logged in and have the right context selected for
          this installation's Management API.`}
      command={`kubectl gs login ${k8sAPIUrl.current}${
        displayClusterAdminFlag ? ' --cluster-admin' : ''
      }`}
    />
  );
};

export default LoginGuideStep;
