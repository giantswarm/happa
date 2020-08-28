import { IState } from 'reducers/types';
import { Constants } from 'shared/constants';
import { IStoredAppCatalog } from 'stores/appcatalog/types';

export const selectIngressCatalog: (state: IState) => IStoredAppCatalog = (
  state
) =>
  state.entities?.catalogs?.items?.[
    Constants.INSTALL_INGRESS_TAB_APP_CATALOG_NAME
  ];

export const selectIngressAppToInstall: (
  state: IState
) => Record<string, never> = (state) => {
  const ingressCatalog = selectIngressCatalog(state);

  return ingressCatalog?.apps?.[Constants.INSTALL_INGRESS_TAB_APP_NAME]?.[0];
};
