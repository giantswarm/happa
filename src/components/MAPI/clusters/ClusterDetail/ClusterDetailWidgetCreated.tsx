import * as capiv1beta1 from 'model/services/mapi/capiv1beta1';
import React from 'react';
import styled from 'styled-components';
import { Dot } from 'styles';
import Date from 'UI/Display/Date';
import ClusterDetailWidget from 'UI/Display/MAPI/clusters/ClusterDetail/ClusterDetailWidget';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';

const StyledDot = styled(Dot)`
  padding: 0;
`;

const CapitalizedText = styled.div`
  &:first-letter {
    text-transform: uppercase;
  }
`;

interface IClusterDetailWidgetCreatedProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
    'title'
  > {
  cluster?: capiv1beta1.ICluster;
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
        {(value) => (
          <CapitalizedText>
            <Date relative={true} value={value} />
          </CapitalizedText>
        )}
      </OptionalValue>
      <StyledDot />
      <OptionalValue value={creationDate} loaderWidth={150}>
        {(value) => <Date value={value} />}
      </OptionalValue>
    </ClusterDetailWidget>
  );
};

export default ClusterDetailWidgetCreated;
