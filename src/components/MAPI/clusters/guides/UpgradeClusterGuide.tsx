import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import { getCurrentInstallationContextName } from 'MAPI/guides/utils';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IUpgradeClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  clusterName: string;
  clusterNamespace: string;
  targetReleaseVersion: string;
  canUpdateCluster?: boolean;
}

const UpgradeClusterGuide: React.FC<IUpgradeClusterGuideProps> = ({
  clusterName,
  clusterNamespace,
  targetReleaseVersion,
  canUpdateCluster,
  ...props
}) => {
  const context = getCurrentInstallationContextName();

  return (
    <CLIGuide
      title='Upgrade this cluster via the Management API'
      footer={
        <CLIGuideAdditionalInfo
          links={[
            {
              label: 'kubectl gs plugin installation',
              href: docs.kubectlGSInstallationURL,
              external: true,
            },
            {
              label: 'Cluster CRD schema',
              href: docs.crdSchemaURL(docs.crds.xk8sio.cluster),
              external: true,
            },
            {
              label: 'Management API introduction',
              href: docs.managementAPIIntroduction,
              external: true,
            },
          ]}
        />
      }
      {...props}
    >
      <CLIGuideStepList>
        {!canUpdateCluster && <UnauthorizedMessage />}
        <LoginGuideStep />
        <CLIGuideStep
          title='2. Update the release label'
          command={`
          kubectl --context ${context} \\
            label clusters.cluster.x-k8s.io ${clusterName} \\
            --namespace ${clusterNamespace} \\
            --overwrite release.giantswarm.io/version=${targetReleaseVersion}
          `}
        />
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default UpgradeClusterGuide;
