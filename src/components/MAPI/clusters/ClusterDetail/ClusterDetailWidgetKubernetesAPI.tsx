import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import RoutePath from 'lib/routePath';
import { OrganizationsRoutes } from 'model/constants/routes';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Button from 'UI/Controls/Button';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

interface IClusterDetailWidgetKubernetesAPIProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetKubernetesAPI: React.FC<IClusterDetailWidgetKubernetesAPIProps> =
  ({ cluster, ...props }) => {
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
        <OptionalValue value={k8sApiURL} loaderWidth={400} loaderHeight={24}>
          {/* @ts-expect-error */}
          {(value) => <URIBlock>{value}</URIBlock>}
        </OptionalValue>

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

export default ClusterDetailWidgetKubernetesAPI;
