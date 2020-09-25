import { IState } from 'reducers/types';
import { Constants } from 'shared/constants';

export const selectIngressCatalog = (state: IState): IAppCatalog | undefined =>
  state.entities.catalogs.items[Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME];

export const selectIngressAppToInstall = (
  state: IState
): IAppCatalogApp | undefined => {
  const ingressCatalog = selectIngressCatalog(state);

  return ingressCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];
};
