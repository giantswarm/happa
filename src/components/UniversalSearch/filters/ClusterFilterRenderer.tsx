import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import * as React from 'react';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import RendererWrapper from 'UniversalSearch/filters/RendererWrapper';
import { IGenericFilterRendererProps } from 'UniversalSearch/filters/types';

const ClusterName = styled.span`
  font-weight: 700;
  margin-left: ${({ theme }) => theme.spacingPx * 4}px;
`;

interface IClusterFilterRendererProps
  extends IGenericFilterRendererProps<ICluster> {}

const ClusterFilterRenderer: React.FC<IClusterFilterRendererProps> = ({
  result,
  type,
}) => {
  return (
    <RendererWrapper type={type}>
      <ClusterIDLabel clusterID={result.id} copyEnabled={false} />
      <ClusterName>{result.name}</ClusterName>
    </RendererWrapper>
  );
};

ClusterFilterRenderer.propTypes = {
  // @ts-ignore
  result: PropTypes.object.isRequired,
  type: PropTypes.string.isRequired,
};

export default ClusterFilterRenderer;
