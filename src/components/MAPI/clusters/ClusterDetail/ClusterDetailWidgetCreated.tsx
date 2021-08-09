import { Text } from 'grommet';
import { formatDate, getRelativeDateFromNow } from 'lib/helpers';
import * as capiv1alpha3 from 'model/services/mapi/capiv1alpha3';
import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidgetOptionalValue';

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
      <ClusterDetailWidgetOptionalValue value={creationDate}>
        {(value) => <Text>{getRelativeDateFromNow(value as string)}</Text>}
      </ClusterDetailWidgetOptionalValue>
      <StyledDot />
      <ClusterDetailWidgetOptionalValue value={creationDate} loaderWidth={150}>
        {(value) => <Text>{formatDate(value as string)}</Text>}
      </ClusterDetailWidgetOptionalValue>
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetCreated.propTypes = {
  cluster: PropTypes.object as PropTypes.Requireable<capiv1alpha3.ICluster>,
};

export default ClusterDetailWidgetCreated;
