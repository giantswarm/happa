import InstallAppModal from 'components/Apps/AppDetail/InstallAppModal/InstallAppModal';
import { push } from 'connected-react-router';
import { AppsRoutes } from 'model/constants/routes';
import { loadAppReadme } from 'model/stores/appcatalog/actions';
import { CLUSTER_LOAD_APP_README_ERROR } from 'model/stores/appcatalog/constants';
import { selectApp, selectReadmeURL } from 'model/stores/appcatalog/selectors';
import { IState } from 'model/stores/state';
import React, { useEffect, useMemo } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { Dispatch } from 'redux';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';
import useError from 'utils/hooks/useError';
import RoutePath from 'utils/routePath';

const AppDetail: React.FC<React.PropsWithChildren<unknown>> = () => {
  const match = useRouteMatch();

  const params = match.params as {
    catalogName: string;
    app: string;
    version: string;
  };

  const [app, catalog, otherVersions] = useSelector(
    selectApp(params.catalogName, params.app, params.version)
  );

  const { errorMessage: readmeErrorMessage, clear: clearReadmeError } =
    useError(CLUSTER_LOAD_APP_README_ERROR);

  useEffect(() => {
    clearReadmeError();
  }, [catalog, app]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dispatch: Dispatch<any> = useDispatch();

  useEffect(() => {
    if (catalog && app) {
      dispatch(loadAppReadme(catalog.metadata.name, app));
    }
  }, [catalog, app, dispatch]);

  let readmeURL: string | undefined = '';
  if (app) {
    readmeURL = selectReadmeURL(app);
  }

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  const selectVersion = (v: string) => {
    if (v && app && catalog) {
      const path = RoutePath.createUsablePath(AppsRoutes.AppDetail, {
        catalogName: catalog.metadata.name,
        app: app.name,
        version: v,
      });

      dispatch(push(path));
    }
  };

  const versions = useMemo(
    () =>
      otherVersions.map((v) => ({
        chartVersion: v.version,
        created: v.created,
        includesVersion: v.appVersion,
        test: false,
      })),
    [otherVersions]
  );

  return (
    <Breadcrumb
      data={{
        title: app?.name.toUpperCase(),
        pathname: match.url,
      }}
    >
      {app && catalog && (
        <AppDetailPage
          appTitle={app.name}
          appIconURL={app.icon}
          catalogName={catalog.spec.title}
          catalogDescription={catalog.spec.description}
          catalogIcon={catalog.spec.logoURL}
          otherVersions={versions}
          chartVersion={app.version}
          createDate={app.created}
          includesVersion={app.appVersion}
          description={app.description}
          website={app.home}
          keywords={app.keywords}
          readmeURL={readmeURL}
          readmeError={readmeErrorMessage}
          readme={app.readme}
          selectVersion={selectVersion}
          installAppModal={
            <InstallAppModal
              app={{
                catalog: catalog.metadata.name,
                name: app.name,
                versions,
              }}
              selectedClusterID={selectedClusterID}
            />
          }
        />
      )}
    </Breadcrumb>
  );
};

export default AppDetail;
