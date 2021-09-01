import { Text } from 'grommet';
import { formatDate, relativeDate } from 'lib/helpers';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
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

const ClusterDetailWidgetCreated: React.FC<IClusterDetailWidgetCreatedProps> = ({
  cluster,
  ...props
}) => {
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
        {(value) => <Text>{relativeDate(value as string)}</Text>}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={creationDate} loaderWidth={150}>
        {(value) => <Text>{formatDate(value as string)}</Text>}
      </OptionalValue>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetCreated;
