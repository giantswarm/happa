import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import RoutePath from 'lib/routePath';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { OrganizationsRoutes } from 'shared/constants/routes';
import Button from 'UI/Controls/Button';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';

interface IClusterDetailWidgetKubernetesAPIProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetKubernetesAPI: React.FC<IClusterDetailWidgetKubernetesAPIProps> = ({
  cluster,
  ...props
}) => {
  const { clusterId, orgId } = useParams<{
    clusterId: string;
    orgId: string;
  }>();

  const k8sApiURL = cluster
    ? capiv1alpha3.getKubernetesAPIEndpointURL(cluster)
    : undefined;

  const gettingStartedPath = useMemo(() => {
    return RoutePath.createUsablePath(
      OrganizationsRoutes.Clusters.GettingStarted.Overview,
      { orgId, clusterId }
    );
  }, [orgId, clusterId]);

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
      <ClusterDetailWidgetOptionalValue
        value={k8sApiURL}
        loaderWidth={400}
        loaderHeight={24}
      >
        {/* @ts-expect-error */}
        {(value) => <URIBlock>{value}</URIBlock>}
      </ClusterDetailWidgetOptionalValue>

      {typeof k8sApiURL !== 'undefined' && (
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

ClusterDetailWidgetKubernetesAPI.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetKubernetesAPI;
