import styled from '@emotion/styled';
import { CLUSTER_LOAD_APPS_REQUEST } from 'actions/actionTypes';
import { installApp, loadApps } from 'actions/appActions';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IState } from 'reducers/types';
import { AnyAction } from 'redux';
import { ThunkDispatch } from 'redux-thunk';
import {
  selectIngressAppFromCluster,
  selectLoadingFlagByAction,
} from 'selectors/clusterSelectors';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.darkBlueLighter1};
  border-radius: ${({ theme }) => theme.border_radius};
  padding: ${({ theme }) => theme.spacingPx * 5}px;
`;

const Text = styled.span`
  margin-left: ${({ theme }) => theme.spacingPx * 2}px;
`;

interface IInstallIngressButtonProps extends React.ComponentProps<'div'> {
  cluster: Record<string, never>;
}

const InstallIngressButton: React.FC<IInstallIngressButtonProps> = ({
  cluster,
  ...rest
}) => {
  const [isInstalling, setIsInstalling] = useState(false);

  const isLoadingApps = useSelector((state) =>
    selectLoadingFlagByAction(state, CLUSTER_LOAD_APPS_REQUEST)
  );
  const ingressApp = selectIngressAppFromCluster(cluster);
  const isLoading = isLoadingApps || isInstalling;

  const clusterID = cluster.id;

  const dispatch: ThunkDispatch<IState, undefined, AnyAction> = useDispatch();

  useEffect(() => {
    dispatch(loadApps(clusterID));
  }, [dispatch, clusterID]);

  const installIngressController = async () => {
    try {
      setIsInstalling(true);

      await dispatch(
        installApp(
          {
            catalog: 'giantswarm',
            chartName: 'nginx-ingress-controller-app',
            namespace: 'kube-system',
            name: 'nginx-ingress-controller-app',
            valuesYAML: '',
            secretsYAML: '',
            version: '1.6.9',
          },
          clusterID
        )
      );

      await dispatch(loadApps(clusterID));
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <Wrapper {...rest}>
      {!ingressApp && (
        <Button
          loading={isLoading}
          bsStyle='primary'
          bsSize='lg'
          onClick={installIngressController}
        >
          Install Ingress Controller
        </Button>
      )}

      {!isLoading && (
        <Text>
          {ingressApp ? (
            '🎉 Ingress controller installed. Please continue to the next step.'
          ) : (
            <>
              Click this button to install an ingress controller on{' '}
              <ClusterIDLabel clusterID={cluster.id} />
            </>
          )}
        </Text>
      )}
    </Wrapper>
  );
};

InstallIngressButton.propTypes = {
  // @ts-ignore
  cluster: PropTypes.object.isRequired,
};

export default InstallIngressButton;
