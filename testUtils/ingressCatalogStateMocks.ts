import { Constants } from 'shared';
import { appCatalogsResponse } from 'testUtils/mockHttpCalls';

const ingressCatalog = appCatalogsResponse.find(
  (c) => c.metadata.name === Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
);
export const catalogsState = {
  entities: {
    catalogs: {
      items: {
        [Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME]: ingressCatalog,
      },
    },
  },
};
