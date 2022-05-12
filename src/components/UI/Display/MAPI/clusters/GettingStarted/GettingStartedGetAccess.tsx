import { Box, Heading, Paragraph } from 'grommet';
import { getK8sAPIUrl } from 'MAPI/utils';
import * as docs from 'model/constants/docs';
import React, { useRef } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router';
import ClusterIDLabel, {
  ClusterIDLabelType,
} from 'UI/Display/Cluster/ClusterIDLabel';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';
import Aside from 'UI/Layout/Aside';

interface IGettingStartedGetAccessProps {}

const GettingStartedGetAccess: React.FC<
  React.PropsWithChildren<IGettingStartedGetAccessProps>
> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { clusterId } = match.params;

  const k8sAPIUrl = useRef(getK8sAPIUrl());

  return (
    <Breadcrumb
      data={{
        title: 'CONFIGURE',
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1}>
          Configure a kubectl context for cluster{' '}
          <ClusterIDLabel
            clusterID={clusterId}
            variant={ClusterIDLabelType.Name}
          />
        </Heading>
        <Paragraph fill={true}>
          <code>kubectl gs</code> is a <code>kubectl</code> plugin for the Giant
          Swarm Management API. It&apos;s perfectly suited to create credentials
          for <code>kubectl</code> in one step.{' '}
          <a
            href='https://krew.sigs.k8s.io/'
            target='_blank'
            rel='noopener noreferrer'
          >
            Krew
          </a>{' '}
          provides the most convenient way to install <code>kubectl gs</code>{' '}
          and keep it up to date:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl krew install gs</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          Run this command to make sure the installation succeeded. You should
          see information regarding the commands available:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl gs</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          To update <code>kubectl gs</code> to the latest version:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl gs selfupdate</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          To install without Krew, download the{' '}
          <a
            href='https://github.com/giantswarm/kubectl-gs/releases/latest'
            target='_blank'
            rel='noopener noreferrer'
          >
            latest release
          </a>{' '}
          from GitHub for your platform, unpack the archive, and move it to a
          location covered by your <code>PATH</code> environment variable. For
          more information, please see the{' '}
          <a
            href={docs.kubectlGSInstallationURL}
            target='_blank'
            rel='noopener noreferrer'
          >
            installation guide
          </a>
          .
        </Paragraph>

        <Aside>
          <strong>Windows Subsystem for Linux 2 (WSL2):</strong> After
          successfully installing <code>kubectl gs</code>, run the following
          command so that <code>kubectl gs login</code> can open your browser:
          <CodeBlock>
            <Prompt>sudo ln -s $(which wslview) /usr/local/bin/xdg-open</Prompt>
          </CodeBlock>
        </Aside>
        <Paragraph fill={true}>
          Next, we let <code>kubectl gs</code> do several things in one step:
        </Paragraph>
        <ul>
          <li>
            Create a new client certificate for you to access this cluster
          </li>
          <li>Download your client certificate</li>
          <li>Download the CA certificate for your cluster</li>
          <li>
            Update your kubectl configuration to add settings and credentials
            for the cluster
          </li>
        </ul>
        <Paragraph fill={true}>
          Here is the command that you need to execute for all this:
        </Paragraph>
        <CodeBlock>
          <Prompt>
            {`
                kubectl gs login ${k8sAPIUrl.current} \\
                  --workload-cluster ${clusterId} \\
                  --certificate-group system:masters \\
                  --certificate-ttl 3h`}
          </Prompt>
        </CodeBlock>
        <Paragraph fill={true}>In case you were wondering:</Paragraph>
        <ul>
          <li>
            <code>--workload-cluster</code> selects the cluster to provide
            access to.
          </li>
          <li>
            <code>--certificate-group</code> specifies which RBAC group the
            client using this certificate will be assigned to. The value{' '}
            <code>system:masters</code> is a fake group name defined by
            Kubernetes, granted all possible permissions. Please be careful with
            this powerful certificate!
          </li>
          <li>
            <code>--certificate-ttl</code> specifies how long the client
            certificate should live for.
          </li>
        </ul>
        <Paragraph fill={true}>
          After execution, you should see what happened in detail. After
          credentials and settings have been added, the context matching your
          Giant Swarm Kubernetes cluster has been selected for use in{' '}
          <code>kubectl</code>. You can now check things using these commands:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl cluster-info</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          This should print some information on your cluster.
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl get nodes</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          Here you should see a list of the worker nodes in your cluster.
        </Paragraph>
        <Paragraph fill={true}>
          Now that this is done, let&apos;s deploy some software on your cluster
          and dig a little deeper.
        </Paragraph>
      </Box>
    </Breadcrumb>
  );
};

export default GettingStartedGetAccess;
