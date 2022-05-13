import { Box, Heading, Paragraph } from 'grommet';
import GettingStartedPlatformTabs from 'MAPI/clusters/GettingStarted/GettingStartedPlatformTabs';
import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useRouteMatch } from 'react-router';
import { CodeBlock, Output, Prompt } from 'UI/Display/Documentation/CodeBlock';
import Aside from 'UI/Layout/Aside';

function getClusterBaseDomain(
  clusterName: string,
  ingressBaseDomain: string
): string {
  return `${clusterName}.${ingressBaseDomain}`;
}

function getHelloWorldURL(clusterBaseDomain: string) {
  return `http://helloworld.${clusterBaseDomain}`;
}

interface IGettingStartedSimpleExampleProps {}

const GettingStartedSimpleExample: React.FC<
  React.PropsWithChildren<IGettingStartedSimpleExampleProps>
> = () => {
  const match = useRouteMatch<{ orgId: string; clusterId: string }>();
  const { clusterId } = match.params;

  const clusterBaseDomain = getClusterBaseDomain(
    clusterId,
    window.config.ingressBaseDomain
  );
  const helloWorldURL = getHelloWorldURL(clusterBaseDomain);

  return (
    <Breadcrumb
      data={{
        title: 'SIMPLE EXAMPLE',
        pathname: match.url,
      }}
    >
      <Box>
        <Heading level={1}>Let&apos;s create an example application</Heading>
        <Paragraph fill={true}>
          To check if every part of your cluster is running as it should,
          let&apos;s create an entire application. When set up, this application
          will provide a little web server running in multiple pods.
        </Paragraph>
        <Paragraph fill={true}>
          We use <code>kubectl</code> to create the service, deployment, and
          ingress resource from a manifest hosted on GitHub.
        </Paragraph>
        <Aside>
          <i
            className='fa fa-info'
            aria-label='For learners'
            role='presentation'
            aria-hidden={true}
          />{' '}
          If you&apos;re new to Kubernetes: A manifest describes things to
          create in Kubernetes. In this case the manifest describes two
          different things, a service and a deployment. The service is there to
          expose containers (here: the ones with the label app: helloworld)
          inside your cluster via a certain hostname and port. The deployment
          describes your helloworld deployment. It manages a replica set, which
          ensures that a number of pods (two, actually) containing Docker
          containers from a certain image are running.
        </Aside>
        <Paragraph fill={true}>First we download the manifest:</Paragraph>
        <CodeBlock>
          <Prompt>
            {`
                  wget https://raw.githubusercontent.com/giantswarm/helloworld/master/helloworld-manifest.yaml
                `}
          </Prompt>
        </CodeBlock>
        <Paragraph fill={true}>
          Next replace the placeholder <code>YOUR_CLUSTER_BASE_DOMAIN</code>{' '}
          with <code>{clusterBaseDomain}</code>.
        </Paragraph>
        <Paragraph fill={true}>
          If you are on Linux or Mac OS you can use the command below to do
          this. Windows users willl have to use their favorite text editor and
          manually edit the <code>helloworld-manifest.yaml</code> file.
        </Paragraph>
        <GettingStartedPlatformTabs
          margin={{ top: 'medium', bottom: 'large' }}
          linuxContent={
            <CodeBlock>
              <Prompt>{`sed -i"" "s/YOUR_CLUSTER_BASE_DOMAIN/${clusterBaseDomain}/" helloworld-manifest.yaml`}</Prompt>
            </CodeBlock>
          }
          macOSContent={
            <CodeBlock>
              <Prompt>{`sed -i "" "s/YOUR_CLUSTER_BASE_DOMAIN/${clusterBaseDomain}/" helloworld-manifest.yaml`}</Prompt>
            </CodeBlock>
          }
          windowsContent={
            <Paragraph fill={true} margin='none'>
              Edit the <code>helloworld-manifest.yaml</code> file manually in
              your favourite code editor.
            </Paragraph>
          }
        />
        <Paragraph fill={true}>
          Finally apply the manifest to your cluster:
        </Paragraph>
        <CodeBlock>
          <Prompt>
            {`
                 kubectl apply -f helloworld-manifest.yaml
                `}
          </Prompt>
          <Output>
            {`
service/helloworld created
deployment.apps/helloworld created
poddisruptionbudget.policy/helloworld-pdb created
ingress.networking.k8s.io/helloworld created
                `}
          </Output>
        </CodeBlock>
        <Paragraph fill={true}>
          The deployment will create a replica set, which in turn will create
          pods with the Docker containers running. Once they are up, which
          should take only a few seconds, you can access them using this URL:
        </Paragraph>
        <Paragraph fill={true}>
          <a href={helloWorldURL} rel='noopener noreferrer' target='_blank'>
            {helloWorldURL}
          </a>
        </Paragraph>
        <Paragraph fill={true}>
          This should show a little welcome message from the Giant Swarm team.
        </Paragraph>
        <Heading level={1} margin={{ top: 'large' }}>
          Inspecting your service
        </Heading>
        <Paragraph fill={true}>
          Let&apos;s inspect what has actually been generated by Kubernetes
          based on our manifest. This first command lists all deployments,
          filtered to those that have a label <code>app: helloworld</code>:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl get deployment -l app=helloworld</Prompt>
          <Output>
            {`
NAME         READY   UP-TO-DATE   AVAILABLE   AGE
helloworld   2/2     2            2           2m
                `}
          </Output>
        </CodeBlock>
        <Paragraph fill={true}>
          It should tell us that 2 of our 2 desired pods are currently running.
          Then we list the available services with the according label:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl get svc -l app=helloworld</Prompt>
          <Output>
            {`
NAME         TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
helloworld   ClusterIP   172.31.144.55   <none>        8080/TCP   2m
                `}
          </Output>
        </CodeBlock>
        <Paragraph fill={true}>And finally we list the pods:</Paragraph>
        <CodeBlock>
          <Prompt>kubectl get pods -l app=helloworld</Prompt>
          <Output>
            {`
NAME                          READY     STATUS    RESTARTS   AGE
helloworld-3495070191-0ynir   1/1       Running   0          3m
helloworld-3495070191-onuik   1/1       Running   0          3m
                `}
          </Output>
        </CodeBlock>
        <Aside>
          <i
            className='fa fa-info'
            aria-label='For learners'
            role='presentation'
            aria-hidden={true}
          />{' '}
          The exact pod names vary in each case, the first suffix functions a
          bit like a version number for your deployment, this changes with
          updates to the deployment. The last part of the pod name is used by
          Kubernetes to disambiguate the name using a unique suffixes.
        </Aside>
        <Paragraph fill={true}>
          To investigate a bit closer what our containers are doing inside their
          pods, we can look at their logs, one pod at a time. Be sure to replace
          the version and suffix fields (in brackets) with the actual ones you
          got from the
          <code>get pods</code> command above.
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl logs --selector app=helloworld</Prompt>
          <Output>
            {`
2014/07/01 09:57:30 Starting up at :8080
2014/07/01 09:57:40 GET /giant-swarm-logo.svg
2014/07/01 09:57:41 GET /favicon32.ico
2014/07/01 09:57:30 Starting up at :8080
2014/07/01 09:57:40 GET /
2014/07/01 09:57:40 GET /blue-bg.jpg
                `}
          </Output>
        </CodeBlock>
        <Paragraph fill={true}>
          You should see in the log entries that the requests for the HTML page,
          the logo, the favicon, and the background images have been distributed
          over both running pods and their respective containers pretty much
          randomly.
        </Paragraph>
        <Paragraph fill={true}>
          To clean things up, we use the <code>kubectl delete</code> command on
          the service, deployment, and ingress we created initially:
        </Paragraph>
        <CodeBlock>
          <Prompt>kubectl delete -f helloworld-manifest.yaml</Prompt>
          <Output>
            {`
service "helloworld" deleted
deployment.apps "helloworld" deleted
poddisruptionbudget.policy "helloworld-pdb" deleted
ingress.networking.k8s.io "helloworld" deleted
                `}
          </Output>
        </CodeBlock>
      </Box>
    </Breadcrumb>
  );
};

export default GettingStartedSimpleExample;
