import { useAuthProvider } from 'Auth/MAPI/MapiAuthProvider';
import { Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { GenericResponseError } from 'model/clients/GenericResponseError';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import useSWR from 'swr';
import KubernetesVersionLabel from 'UI/Display/Cluster/KubernetesVersionLabel';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import NotAvailable from 'UI/Display/NotAvailable';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';
import { getK8sVersionEOLDate } from 'utils/config';
import { useHttpClientFactory } from 'utils/hooks/useHttpClientFactory';

import { usePermissionsForCPNodes } from '../permissions/usePermissionsForCPNodes';
import {
  fetchControlPlaneNodesK8sVersions,
  fetchControlPlaneNodesK8sVersionsKey,
} from '../utils';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const StyledLink = styled.a`
  i {
    color: ${({ theme }) => normalizeColor('text-weak', theme)};
  }

  &:hover {
    i {
      color: ${({ theme }) => normalizeColor('text', theme)};
    }
  }
`;

function getReleaseNotesURL(
  clusterAppName: string,
  clusterAppVersion: string
): string {
  return `https://github.com/giantswarm/${clusterAppName}/releases/tag/v${clusterAppVersion}`;
}

interface IClusterDetailWidgetVersionsProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
}

const ClusterDetailWidgetVersions: React.FC<
  IClusterDetailWidgetVersionsProps
> = ({ cluster, ...props }) => {
  const clusterAppVersion = cluster
    ? capiv1beta1.getClusterAppVersion(cluster)
    : undefined;

  const clusterAppReleaseNotesURL = useMemo(() => {
    if (!cluster) return undefined;

    const clusterAppName = capiv1beta1.getClusterAppName(cluster);
    if (!clusterAppName || !clusterAppVersion) return '';

    return getReleaseNotesURL(clusterAppName, clusterAppVersion);
  }, [cluster, clusterAppVersion]);

  const provider = window.config.info.general.provider;
  const { canList: canListCPNodes } = usePermissionsForCPNodes(
    provider,
    cluster?.metadata.namespace ?? ''
  );

  const controlPlaneNodesK8sVersionsKey =
    cluster && canListCPNodes
      ? fetchControlPlaneNodesK8sVersionsKey(cluster)
      : null;

  const clientFactory = useHttpClientFactory();
  const auth = useAuthProvider();

  const { data: k8sVersions, error: k8sVersionsError } = useSWR<
    string[],
    GenericResponseError
  >(controlPlaneNodesK8sVersionsKey, () =>
    fetchControlPlaneNodesK8sVersions(clientFactory, auth, cluster!)
  );

  const k8sVersion = useMemo(() => {
    if (!k8sVersions) return undefined;
    if (k8sVersions.length === 0 || k8sVersionsError || !canListCPNodes)
      return '';

    // Remove the `v` prefix.
    return k8sVersions[0].slice(1);
  }, [canListCPNodes, k8sVersions, k8sVersionsError]);

  return (
    <ClusterDetailWidget title='Versions' inline={true} {...props}>
      <Box direction='row' gap='xsmall' wrap={true} align='center'>
        <OptionalValue
          value={clusterAppVersion}
          replaceEmptyValue={false}
          loaderWidth={150}
        >
          {(value) => (
            <>
              <Text
                aria-label={`Cluster app version: ${
                  value || 'no information available'
                } `}
              >
                <i
                  className='fa fa-version-tag'
                  role='presentation'
                  aria-hidden='true'
                />{' '}
                Cluster app
              </Text>{' '}
              {clusterAppReleaseNotesURL === '' ? (
                <Text>{value || <NotAvailable />}</Text>
              ) : (
                <StyledLink
                  href={clusterAppReleaseNotesURL ?? '#'}
                  rel='noopener noreferrer'
                  target='_blank'
                  aria-label={`Cluster app version ${value} release notes`}
                >
                  <Text>
                    {value ? (
                      <Truncated numStart={8} numEnd={3}>
                        {value}
                      </Truncated>
                    ) : (
                      <NotAvailable />
                    )}
                  </Text>
                  <i
                    className='fa fa-open-in-new'
                    aria-hidden={true}
                    role='presentation'
                  />
                </StyledLink>
              )}
            </>
          )}
        </OptionalValue>
        <StyledDot />
        <OptionalValue
          value={k8sVersion}
          replaceEmptyValue={false}
          loaderWidth={150}
        >
          {(value) => (
            <KubernetesVersionLabel
              hidePatchVersion={false}
              hideLabel={false}
              version={value}
              eolDate={getK8sVersionEOLDate(value) ?? undefined}
            />
          )}
        </OptionalValue>
      </Box>

      {clusterAppVersion && null}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetVersions;
