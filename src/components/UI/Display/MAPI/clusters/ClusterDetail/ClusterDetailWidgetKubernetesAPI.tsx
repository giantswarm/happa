import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

import { IClusterItem } from '../types';
import ClusterDetailWidget from './ClusterDetailWidget';
import ClusterDetailWidgetOptionalValue from './ClusterDetailWidgetOptionalValue';

const GetStartedButton = styled(Button)`
  text-transform: uppercase;
`;

interface IClusterDetailWidgetKubernetesAPIProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ClusterDetailWidget>,
      'title'
    >,
    Pick<IClusterItem, 'k8sApiURL'> {
  gettingStartedPath: string;
}

const ClusterDetailWidgetKubernetesAPI: React.FC<IClusterDetailWidgetKubernetesAPIProps> = ({
  k8sApiURL,
  gettingStartedPath,
  ...props
}) => {
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
          <GetStartedButton tabIndex={-1}>
            <i className='fa fa-start' aria-hidden={true} role='presentation' />
            Get Started
          </GetStartedButton>
        </Link>
      )}
    </ClusterDetailWidget>
  );
};

ClusterDetailWidgetKubernetesAPI.propTypes = {
  gettingStartedPath: PropTypes.string.isRequired,
  k8sApiURL: PropTypes.string,
};

export default ClusterDetailWidgetKubernetesAPI;
