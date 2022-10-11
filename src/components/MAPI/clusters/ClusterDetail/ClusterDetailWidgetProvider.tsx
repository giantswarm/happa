import { Grid } from 'grommet';
import { ProviderCluster } from 'MAPI/types';
import * as capav1beta1 from 'model/services/mapi/capav1beta1';
import * as capgv1beta1 from 'model/services/mapi/capgv1beta1';
import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import * as capzv1beta1 from 'model/services/mapi/capzv1beta1';
import * as infrav1alpha2 from 'model/services/mapi/infrastructurev1alpha2';
import * as infrav1alpha3 from 'model/services/mapi/infrastructurev1alpha3';
import React from 'react';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';

import ClusterDetailWidgetProviderAWS from './ClusterDetailWidgetProviderAWS';
import ClusterDetailWidgetProviderAzure from './ClusterDetailWidgetProviderAzure';
import ClusterDetailWidgetProviderCAPA from './ClusterDetailWidgetProviderCAPA';
import ClusterDetailWidgetProviderCAPG from './ClusterDetailWidgetProviderCAPG';
import ClusterDetailWidgetProviderLoader from './ClusterDetailWidgetProviderLoader';

interface IClusterDetailWidgetProviderProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
  providerCluster?: ProviderCluster;
}

const ClusterDetailWidgetProvider: React.FC<
  React.PropsWithChildren<IClusterDetailWidgetProviderProps>
> = ({ cluster, providerCluster, ...props }) => {
  const isLoading =
    typeof cluster === 'undefined' || typeof providerCluster === 'undefined';

  const { kind, apiVersion } = cluster?.spec?.infrastructureRef || {};

  return (
    <ClusterDetailWidget title='Provider' inline={true} {...props}>
      <Grid
        columns={['auto', 'flex']}
        gap={{ column: 'small' }}
        align='baseline'
        data-testid='provider-info'
      >
        {isLoading ? (
          <ClusterDetailWidgetProviderLoader />
        ) : kind === capav1beta1.AWSCluster &&
          apiVersion === capav1beta1.ApiVersion ? (
          <ClusterDetailWidgetProviderCAPA
            providerCluster={providerCluster as capav1beta1.IAWSCluster}
          />
        ) : kind === capgv1beta1.GCPCluster ? (
          <ClusterDetailWidgetProviderCAPG
            providerCluster={providerCluster as capgv1beta1.IGCPCluster}
          />
        ) : kind === capzv1beta1.AzureCluster ? (
          <ClusterDetailWidgetProviderAzure
            providerCluster={providerCluster as capzv1beta1.IAzureCluster}
          />
        ) : (kind === infrav1alpha2.AWSCluster &&
            apiVersion === infrav1alpha2.ApiVersion) ||
          (kind === infrav1alpha3.AWSCluster &&
            apiVersion === infrav1alpha3.ApiVersion) ? (
          <ClusterDetailWidgetProviderAWS
            providerCluster={providerCluster as infrav1alpha3.IAWSCluster}
          />
        ) : null}
      </Grid>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetProvider;
