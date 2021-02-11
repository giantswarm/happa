import InstallAppModal from 'components/Apps/AppDetail/InstallAppModal/InstallAppModal';
import useError from 'lib/hooks/useError';
import React, { useEffect } from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useRouteMatch } from 'react-router-dom';
import { loadAppReadme } from 'stores/appcatalog/actions';
import { CLUSTER_LOAD_APP_README_ERROR } from 'stores/appcatalog/constants';
import { selectApp, selectReadmeURL } from 'stores/appcatalog/selectors';
import { IState } from 'stores/state';
import AppDetailPage from 'UI/Display/Apps/AppDetailNew/AppDetailPage';

const AppDetail: React.FC = () => {
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

  let readmeURL = false;
  if (app) {
    readmeURL = Boolean(selectReadmeURL(app));
  }

  const selectedClusterID = useSelector(
    (state: IState) => state.main.selectedClusterID
  );

  return (
    <Breadcrumb
      data={{
        title: 'efk-stack-app'.toUpperCase(),
        pathname: match.url,
      }}
    >
      {app && catalog && (
        <AppDetailPage
          appTitle={app.name}
          appIconURL={app.icon}
          catalogName={catalog.spec.title}
          catalogIcon={catalog.spec.logoURL}
          chartVersion={app.version}
          createDate={app.created}
          includesVersion={app.appVersion}
          description={app.description}
          website={app.home}
          keywords={app.keywords}
          hasReadme={readmeURL}
          readmeError={readmeErrorMessage}
          readme={app.readme}
          installAppModal={
            <InstallAppModal
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
  );
};

export default AppDetail;
