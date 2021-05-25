import { push } from 'connected-react-router';
import useError from 'lib/hooks/useError';
import RoutePath from 'lib/routePath';
import AppInstallModal from 'MAPI/apps/AppInstallModal';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';
import DocumentTitle from 'shared/DocumentTitle';
import { loadAppReadme } from 'stores/appcatalog/actions';
import { CLUSTER_LOAD_APP_README_ERROR } from 'stores/appcatalog/constants';
import { selectApp, selectReadmeURL } from 'stores/appcatalog/selectors';
import { IState } from 'stores/state';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';

const AppDetail: React.FC<{}> = () => {
  const match = useRouteMatch();

  const params = match.params as {
    catalogName: string;
    app: string;
    version: string;
  };

  const [app, catalog, otherVersions] = useSelector(
    selectApp(params.catalogName, params.app, params.version)
  );

  const {
    errorMessage: readmeErrorMessage,
    clear: clearReadmeError,
  } = useError(CLUSTER_LOAD_APP_README_ERROR);

  useEffect(() => {
    clearReadmeError();
  }, [catalog, app]);

  const dispatch = useDispatch();

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

  return (
    <DocumentTitle title={`App Details | ${app?.name}`}>
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
            otherVersions={otherVersions.map((v) => ({
              chartVersion: v.version,
              created: v.created,
              includesVersion: v.appVersion,
              test: false,
            }))}
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
              <AppInstallModal
                app={{
                  catalog: catalog.metadata.name,
                  name: app.name,
                  versions: otherVersions,
                }}
                selectedClusterID={selectedClusterID}
              />
            }
          />
        )}
      </Breadcrumb>
    </DocumentTitle>
  );
};

export default AppDetail;
