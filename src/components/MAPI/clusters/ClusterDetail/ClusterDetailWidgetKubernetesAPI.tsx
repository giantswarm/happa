import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import { usePermissionsForKeyPairs } from 'MAPI/keypairs/permissions/usePermissionsForKeyPairs';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import { selectOrganizations } from 'model/stores/organization/selectors';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import Button from 'UI/Controls/Button';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import RoutePath from 'utils/routePath';

interface IClusterDetailWidgetKubernetesAPIProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
}

const ClusterDetailWidgetKubernetesAPI: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetKubernetesAPIProps>
> = ({ cluster, ...props }) => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const provider = window.config.info.general.provider;

  const organizations = useSelector(selectOrganizations());
  const selectedOrg = orgId ? organizations[orgId] : undefined;
  const namespace = selectedOrg?.namespace;

  const k8sApiURL = cluster
    ? capiv1beta1.getKubernetesAPIEndpointURL(cluster)
    : undefined;

  const gettingStartedPath = useMemo(() => {
    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      { orgId, clusterId }
    );
  }, [orgId, clusterId]);

  const { canCreate: canCreateKeyPairs } = usePermissionsForKeyPairs(
    provider,
    namespace ?? ''
  );

  const clusterInOrgNamespace = cluster?.metadata.namespace !== 'default';

  const shouldDisplayGetStarted = useMemo(
    () =>
      canCreateKeyPairs &&
      typeof k8sApiURL !== 'undefined' &&
      clusterInOrgNamespace,
    [canCreateKeyPairs, clusterInOrgNamespace, k8sApiURL]
  );

  return (
    <ClusterDetailWidget
      title='Kubernetes API'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
        justify: 'between',
      }}
      {...props}
    >
      <OptionalValue value={k8sApiURL} loaderWidth={400} loaderHeight={24}>
        {/* @ts-expect-error */}
        {(value) => <URIBlock>{value}</URIBlock>}
      </OptionalValue>

      {shouldDisplayGetStarted && (
        <Link to={gettingStartedPath}>
          <Button
            tabIndex={-1}
            icon={
              <i
                className='fa fa-start'
                aria-hidden={true}
                role='presentation'
              />
            }
          >
            Get started
          </Button>
        </Link>
      )}
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetKubernetesAPI;
