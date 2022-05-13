import { Text } from 'grommet';
import LoginGuideStep from 'MAPI/guides/LoginGuideStep';
import UnauthorizedMessage from 'MAPI/guides/UnauthorizedMessage';
import {
  getCurrentInstallationContextName,
  makeKubectlGSCommand,
  withContext,
  withFormatting,
  withUpdateCluster,
} from 'MAPI/guides/utils';
import { Providers } from 'model/constants';
import * as docs from 'model/constants/docs';
import React from 'react';
import CLIGuide from 'UI/Display/MAPI/CLIGuide';
import CLIGuideAdditionalInfo from 'UI/Display/MAPI/CLIGuide/CLIGuideAdditionalInfo';
import CLIGuideStep from 'UI/Display/MAPI/CLIGuide/CLIGuideStep';
import CLIGuideStepList from 'UI/Display/MAPI/CLIGuide/CLIGuideStepList';

interface IUpgradeClusterGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof CLIGuide>, 'title'> {
  provider: PropertiesOf<typeof Providers>;
  clusterName: string;
  clusterNamespace: string;
  targetReleaseVersion: string;
  canUpdateCluster?: boolean;
}

const UpgradeClusterGuide: React.FC<
  React.PropsWithChildren<IUpgradeClusterGuideProps>
> = ({
  provider,
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
              label: 'kubectl gs update cluster command',
              href: docs.kubectlGSUpdateClusterURL,
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
          title='2. Upgrade the cluster'
          command={makeKubectlGSCommand(
            withContext(context),
            withUpdateCluster({
              provider: provider,
              namespace: clusterNamespace,
              name: clusterName,
              releaseVersion: targetReleaseVersion,
            }),
            withFormatting()
          )}
        >
          <Text>
            <strong>Note:</strong> Add{' '}
            <code>
              --scheduled-time <var>TIME</var>
            </code>{' '}
            to schedule a workload cluster upgrade in the future.{' '}
            <code>
              <var>TIME</var>
            </code>{' '}
            must be in the <code>&quot;YYYY-MM-DD HH:MM&quot;</code> format.
            Timezone UTC is assumed. If not given, the upgrade happens as soon
            as possible.
          </Text>
        </CLIGuideStep>
      </CLIGuideStepList>
    </CLIGuide>
  );
};

export default UpgradeClusterGuide;
