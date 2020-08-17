import {
  IUniversalSearcher,
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import React, { ReactNode, useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

interface IUniversalSearchContextValue {
  searchTerm: string;
  search(newTerm: string): void;
  search<T>(newTerm: string, type: string): void;
  searchResults: IUniversalSearcherResult<unknown>[];
  filters: UniversalSearchFilterMap;
}

const SEARCH_ITEMS_LIMIT = 10;

const initialContextValue: IUniversalSearchContextValue = {
  searchTerm: '',
  search: () => {},
  searchResults: [],
  filters: {},
};

const UniversalSearchContext = React.createContext<
  IUniversalSearchContextValue
>(initialContextValue);

export function useUniversalSearch() {
  return useContext(UniversalSearchContext);
}

interface IUniversalSearchProviderProps {
  controller: IUniversalSearcher;
  children: ReactNode;
}

const UniversalSearchProvider: React.FC<IUniversalSearchProviderProps> = ({
  children,
  controller,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialContextValue.searchTerm);

  const globalState = useSelector((state) => state);
  const results = useRef(initialContextValue.searchResults);
  const filters = useRef(controller.getFilters());

  const search = (term: string, type?: string) => {
    setSearchTerm(term);
    let newResults = initialContextValue.searchResults;
    if (term.length > 0) {
      newResults = controller.search(
        term,
        globalState,
        SEARCH_ITEMS_LIMIT,
        type as string
      );
    }
    results.current = newResults;
  };

  const contextValue: IUniversalSearchContextValue = {
    searchTerm,
    searchResults: results.current,
    search,
    filters: filters.current,
  };

  return (
    <UniversalSearchContext.Provider value={contextValue}>
      {children}
    </UniversalSearchContext.Provider>
  );
};

UniversalSearchProvider.propTypes = {
  // @ts-ignore
  controller: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
};

export default UniversalSearchProvider;
