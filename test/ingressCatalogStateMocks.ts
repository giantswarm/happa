import { Constants } from 'shared/constants';
import { IState } from 'stores/state';
import { appCatalogsResponse } from 'test/mockHttpCalls';

const ingressCatalog = appCatalogsResponse.find(
  (c) => c.metadata.name === Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
) as unknown as IAppCatalog;

export const catalogsState: Partial<IState> = {
  entities: {
    catalogs: {
      items: {
        [Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME]: ingressCatalog,
      },
      isFetching: false,
      lastUpdated: 0,
      ui: {
        selectedCatalogs: {},
        searchQuery: '',
        sortOrder: '',
      },
    },
  } as IState['entities'],
};
