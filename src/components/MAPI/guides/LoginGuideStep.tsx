import { getK8sAPIUrl } from 'MAPI/utils';
import React, { useRef } from 'react';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';

interface ILoginGuideStepProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof CLIGuideStep>,
    'title' | 'command'
  > {}

const LoginGuideStep: React.FC<
  React.PropsWithChildren<ILoginGuideStepProps>
> = (props) => {
  const k8sAPIUrl = useRef(getK8sAPIUrl());

  return (
    <CLIGuideStep
      {...props}
      title={`
          1. Make sure you are logged in and have the right context selected for
          this installation's Management API.`}
      command={`kubectl gs login ${k8sAPIUrl.current}`}
    />
  );
};

export default LoginGuideStep;
