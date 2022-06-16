import { Constants } from 'model/constants';
import { IState } from 'model/stores/state';
import { appCatalogsResponse } from 'test/mockHttpCalls';

const ingressCatalog = appCatalogsResponse.find(
  (c) => c.metadata.name === Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
) as unknown as IAppCatalog;

export const catalogsState: Partial<IState> = {
  entities: {
    catalogs: {
      items: {
        [Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME]: ingressCatalog,
      } as IState['entities']['catalogs']['items'],
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
