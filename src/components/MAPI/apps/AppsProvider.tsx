import produce from 'immer';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

export type SelectedCatalogs = Record<string, boolean>;

export interface IAppsContext {
  selectedCatalogs: SelectedCatalogs;
  selectCatalog: (catalogName: string) => void;
  deselectCatalog: (catalogName: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  sortOrder: string;
  setSortOrder: (orderBy: string) => void;
}

const appsContext = createContext<IAppsContext | null>(null);

interface ISelectCatalogAction {
  type: 'selectCatalog';
  name: string;
}

interface IDeselectCatalogAction {
  type: 'deselectCatalog';
  name: string;
}

interface ISetSearchQueryAction {
  type: 'setSearchQuery';
  value: string;
}

interface ISetSortOrderAction {
  type: 'setSortOrder';
  value: string;
}

type AppsAction =
  | ISelectCatalogAction
  | IDeselectCatalogAction
  | ISetSearchQueryAction
  | ISetSortOrderAction;

interface IAppsState {
  selectedCatalogs: SelectedCatalogs;
  searchQuery: string;
  sortOrder: string;
}

const initialState: IAppsState = {
  selectedCatalogs: {},
  searchQuery: '',
  sortOrder: 'name',
};

const reducer: React.Reducer<IAppsState, AppsAction> = produce(
  (draft, action) => {
    switch (action.type) {
      case 'selectCatalog':
        draft.selectedCatalogs[action.name] = true;
        break;

      case 'deselectCatalog':
        delete draft.selectedCatalogs[action.name];
        break;

      case 'setSearchQuery':
        draft.searchQuery = action.value;
        break;

      case 'setSortOrder':
        draft.sortOrder = action.value;
        break;
    }
  },
  initialState
);

const AppsProvider: React.FC<{}> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const selectedCatalogs = useMemo(
    () => state.selectedCatalogs,
    [state.selectedCatalogs]
  );

  const selectCatalog = useCallback((name: string) => {
    dispatch({
      type: 'selectCatalog',
      name,
    });
  }, []);

  const deselectCatalog = useCallback((name: string) => {
    dispatch({
      type: 'deselectCatalog',
      name,
    });
  }, []);

  const searchQuery = useMemo(() => state.searchQuery, [state.searchQuery]);

  const setSearchQuery = useCallback((value: string) => {
    dispatch({
      type: 'setSearchQuery',
      value,
    });
  }, []);

  const sortOrder = useMemo(() => state.sortOrder, [state.sortOrder]);

  const setSortOrder = useCallback((value: string) => {
    dispatch({
      type: 'setSortOrder',
      value,
    });
  }, []);

  return (
    <appsContext.Provider
      value={{
        selectedCatalogs,
        selectCatalog,
        deselectCatalog,
        searchQuery,
        setSearchQuery,
        sortOrder,
        setSortOrder,
      }}
    >
      {children}
    </appsContext.Provider>
  );
};

export default AppsProvider;

export function useAppsContext(): IAppsContext {
  const appsProvider = useContext(appsContext);
  if (!appsProvider) {
    throw new Error('useAppsContext must be used within an AppsProvider.');
  }

  return useMemo(() => appsProvider, [appsProvider]);
}
