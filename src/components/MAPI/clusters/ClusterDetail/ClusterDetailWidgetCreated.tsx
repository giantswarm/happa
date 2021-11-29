import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import Date from 'UI/Display/Date';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

const StyledDot = styled(Dot)`
  padding: 0;
`;

interface IClusterDetailWidgetCreatedProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1alpha3.ICluster;
}

const ClusterDetailWidgetCreated: React.FC<
  IClusterDetailWidgetCreatedProps
> = ({ cluster, ...props }) => {
  const creationDate = cluster?.metadata.creationTimestamp;

  return (
    <ClusterDetailWidget
      title='Created'
      inline={true}
      contentProps={{
        direction: 'row',
        gap: 'xsmall',
        wrap: true,
        align: 'center',
      }}
      {...props}
    >
      <OptionalValue value={creationDate}>
        {(value) => <Date relative={true} value={value as string} />}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={creationDate} loaderWidth={150}>
        {(value) => <Date value={value as string} />}
      </OptionalValue>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetCreated;
