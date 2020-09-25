import styled from '@emotion/styled';
import RoutePath from 'lib/routePath';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IState } from 'reducers/types';
import {
  selectIngressAppFromCluster,
  selectLoadingFlagByAction,
} from 'selectors/clusterSelectors';
import { Constants } from 'shared/constants';
import { AppCatalogRoutes } from 'shared/constants/routes';
import {
  installLatestIngress,
  prepareIngressTabData,
} from 'stores/appcatalog/actions';
import { selectIngressAppToInstall } from 'stores/appcatalog/selectors';
import { IAsynchronousDispatch } from 'stores/asynchronousAction';
import Button from 'UI/Button';
import ClusterIDLabel from 'UI/ClusterIDLabel';
import { isClusterCreating, isClusterUpdating } from 'utils/clusterUtils';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  background-color: ${({ theme }) => theme.colors.darkBlueLighter1};
  border-radius: ${({ theme }) => theme.border_radius};
  padding: ${({ theme }) => theme.spacingPx * 5}px;
  height: 90px;
`;

const Text = styled.span`
  margin-left: ${({ theme }) => theme.spacingPx * 2}px;
`;

const StyledLink = styled(Link)`
  text-decoration: underline;
`;

interface IInstallIngressButtonProps
  extends React.ComponentPropsWithoutRef<'div'> {
  cluster: V4.ICluster | V5.ICluster;
}

const InstallIngressButton: React.FC<IInstallIngressButtonProps> = ({
  cluster,
  ...rest
}) => {
  const [isNew, setIsNew] = useState(true);

  const isInstalling: boolean | null = useSelector((state) =>
    selectLoadingFlagByAction(state, installLatestIngress().types.request)
  );
  const isPreparingIngressTabData: boolean | null = useSelector((state) =>
    selectLoadingFlagByAction(state, prepareIngressTabData().types.request)
  );
  const installedIngressApp:
    | Record<string, never>
    | undefined = selectIngressAppFromCluster(cluster);

  const ingressAppToInstall = useSelector(selectIngressAppToInstall);

  const ingressAppDetailPath = useMemo(() => {
    if (ingressAppToInstall) {
      const { name, version } = ingressAppToInstall;

      return RoutePath.createUsablePath(AppCatalogRoutes.AppDetail, {
        catalogName: Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME,
        app: name,
        version,
      });
    }

    return '';
  }, [ingressAppToInstall]);

  const isLoading =
    isNew === true ||
    isPreparingIngressTabData === true ||
    isInstalling === true ||
    !ingressAppToInstall?.version;

  const clusterId: string = cluster.id;

  const dispatch: IAsynchronousDispatch<IState> = useDispatch();

  useEffect(() => {
    const prepare = async () => {
      await dispatch(prepareIngressTabData({ clusterId }));
      setIsNew(false);
    };

    prepare();
  }, [dispatch, clusterId]);

  const installIngressController = () =>
    dispatch(installLatestIngress({ clusterId }));

  const clusterIsCreating = isClusterCreating(cluster);
  const clusterIsNotReady = clusterIsCreating || isClusterUpdating(cluster);

  const additionalText = useMemo(() => {
    if (installedIngressApp) {
      return '🎉 Ingress controller installed. Please continue to the next step.';
    }

    if (ingressAppToInstall) {
      return (
        <>
          This will install the{' '}
          <StyledLink to={ingressAppDetailPath} href={ingressAppDetailPath}>
            NGINX Ingress Controller app {ingressAppToInstall.version}
          </StyledLink>{' '}
          on cluster <ClusterIDLabel clusterID={clusterId} />
          {clusterIsNotReady && (
            <>
              {' '}
              once cluster {clusterIsCreating ? 'creation' : 'upgrade'} has
              finished
            </>
          )}
        </>
      );
    }

    return '';
  }, [
    installedIngressApp,
    clusterIsNotReady,
    ingressAppToInstall,
    ingressAppDetailPath,
    clusterId,
    clusterIsCreating,
  ]);

  return (
    <Wrapper {...rest}>
      {!installedIngressApp && (
        <Button
          loading={isLoading}
          bsStyle='primary'
          bsSize='lg'
          loadingTimeout={0}
          onClick={installIngressController}
        >
          Install Ingress Controller
        </Button>
      )}

      {!isLoading && <Text>{additionalText}</Text>}
    </Wrapper>
  );
};

InstallIngressButton.propTypes = {
  // @ts-ignore
  cluster: PropTypes.object.isRequired,
};

export default InstallIngressButton;
