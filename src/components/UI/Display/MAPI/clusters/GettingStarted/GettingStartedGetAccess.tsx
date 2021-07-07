import { Box, Heading, Paragraph } from 'grommet';
import GettingStartedPlatformTabs from 'MAPI/clusters/GettingStarted/GettingStartedPlatformTabs';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useRouteMatch } from 'react-router';
import { getLoggedInUser } from 'stores/main/selectors';
import ClusterIDLabel from 'UI/Display/Cluster/ClusterIDLabel';
import { CodeBlock, Prompt } from 'UI/Display/Documentation/CodeBlock';
import Aside from 'UI/Layout/Aside';

interface IGettingStartedGetAccessProps {}

const GettingStartedGetAccess: React.FC<IGettingStartedGetAccessProps> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { clusterId } = match.params;

  const loggedInUser = useSelector(getLoggedInUser)!;

  return (
    <Breadcrumb
      data={{
        title: 'CONFIGURE',
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1}>
          Configure kubectl for cluster <ClusterIDLabel clusterID={clusterId} />
        </Heading>
        <Paragraph fill={true}>
          The <code>gsctl</code> command line utility provides access to your
          Giant Swarm resources. It&apos;s perfectly suited to create
          credentials for <code>kubectl</code> in one step. Let&apos;s install{' '}
          <code>gsctl</code> quickly.
        </Paragraph>
        <GettingStartedPlatformTabs
          margin={{ top: 'medium', bottom: 'large' }}
          linuxContent={
            <Paragraph fill={true}>
              Download the latest release{' '}
              <a
                href='https://github.com/giantswarm/gsctl/releases'
                rel='noopener noreferrer'
              >
                from GitHub
              </a>
              , unpack the binary and move it to a location covered by your{' '}
              <code>PATH</code> environment variable.
            </Paragraph>
          }
          macOSContent={
            <>
              <Paragraph fill={true}>
                Homebrew provides the most convenient way to install gsctl and
                keep it up to date. To install, use this command:
              </Paragraph>
              <CodeBlock>
                <Prompt>brew tap giantswarm/giantswarm</Prompt>
                <Prompt>brew install gsctl</Prompt>
              </CodeBlock>
              <Paragraph fill={true}>For updating:</Paragraph>
              <CodeBlock>
                <Prompt>brew upgrade gsctl</Prompt>
              </CodeBlock>
              <Paragraph fill={true}>
                To install without homebrew, download the latest release{' '}
                <a
                  href='https://github.com/giantswarm/gsctl/releases'
                  rel='noopener noreferrer'
                >
                  from GitHub
                </a>
                , unpack the binary and move it to a location covered by your{' '}
                <code>PATH</code> environment variable.
              </Paragraph>
            </>
          }
          windowsContent={
            <>
              <Paragraph fill={true}>
                <a href='http://scoop.sh/' rel='noopener noreferrer'>
                  scoop
                </a>{' '}
                enables convenient installs and updates for Windows PowerShell
                users. Before you can install gsctl for the first time, execute
                this:
              </Paragraph>
              <CodeBlock>
                <Prompt>
                  scoop bucket add giantswarm
                  https://github.com/giantswarm/scoop-bucket.git
                </Prompt>
              </CodeBlock>
              <Paragraph fill={true}>To install:</Paragraph>
              <CodeBlock>
                <Prompt>scoop install gsctl</Prompt>
              </CodeBlock>
              <Paragraph fill={true}>To update:</Paragraph>
              <CodeBlock>
                <Prompt>scoop update gsctl</Prompt>
              </CodeBlock>
              <Paragraph fill={true}>
                To install without scoop, download the latest release{' '}
                <a
                  href='https://github.com/giantswarm/gsctl/releases'
                  rel='noopener noreferrer'
                >
                  from GitHub
                </a>
                , unpack the binary and move it to a location covered by your{' '}
                <code>PATH</code> environment variable.
              </Paragraph>
            </>
          }
        />
        <Paragraph fill={true}>
          Run this command to make sure the installation succeeded:
        </Paragraph>
        <CodeBlock>
          <Prompt>{`gsctl --endpoint ${window.config.apiEndpoint} info`}</Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          Next, we let <code>gsctl</code> do several things in one step:
        </Paragraph>
        <ul>
          <li>
            Create a new key pair (certificate and private key) for you to
            access this cluster
          </li>
          <li>Download your key pair</li>
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
                gsctl --endpoint ${window.config.apiEndpoint} \\
                  create kubeconfig \\
                  --cluster ${clusterId} \\
                  --certificate-organizations system:masters \\
                  --auth-token ${loggedInUser.auth.token}`}
          </Prompt>
        </CodeBlock>
        <Paragraph fill={true}>In case you wonder:</Paragraph>
        <ul>
          <li>
            <code>--endpoint</code> sets the right API endpoint to use for your
            installation.
          </li>
          <li>
            <code>--cluster &lt;cluster_id&gt;</code> selects the cluster to
            provide access to.
          </li>
          <li>
            <code>--certificate-organizations system:masters</code> ensures that
            you will be authorized as an administrator when using this keypair.
          </li>
          <li>
            <code>--auth-token &lt;token&gt;</code> saves you from having to
            enter you password again in <code>gsctl</code>, by re-using the
            token from your current web UI session.
          </li>
        </ul>
        <Aside>
          <i
            className='fa fa-info'
            aria-label='For learners'
            role='presentation'
            aria-hidden={true}
          />{' '}
          <code>--certificate-organizations</code> is a flag that sets what
          group you belong to when authenticating against the Kubernetes API.
          The default superadmin group on RBAC (Role Based Access Control)
          enabled clusters is <code>system:masters</code> . All clusters on AWS
          have RBAC enabled, some of our on-prem (KVM) clusters do not.
        </Aside>
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

GettingStartedGetAccess.propTypes = {};

export default GettingStartedGetAccess;
