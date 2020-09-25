import { IState } from 'reducers/types';
import { Constants } from 'shared/constants';

export function selectIngressCatalog(state: IState): IAppCatalog | undefined {
  return state.entities.catalogs.items[
    Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
  ];
}

export function selectIngressAppToInstall(
  state: IState
): IAppCatalogApp | undefined {
  const ingressCatalog = selectIngressCatalog(state);

  return ingressCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];
}
