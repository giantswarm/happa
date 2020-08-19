import useDebounce from 'lib/effects/useDebounce';
import {
  IUniversalSearcher,
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import React, { ReactNode, useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Constants } from 'shared';

interface IUniversalSearchContextValue {
  searchTerm: string;
  search(newTerm: string): void;
  search<T>(newTerm: string, type: string): void;
  searchResults: IUniversalSearcherResult<unknown>[];
  filters: UniversalSearchFilterMap;
}

const SEARCH_ITEMS_LIMIT = 5;
const searchTermRegex = /^\S+$/;

const initialContextValue: IUniversalSearchContextValue = {
  searchTerm: '',
  search: () => {},
  searchResults: [],
  filters: {},
};

const UniversalSearchContext = React.createContext<
  IUniversalSearchContextValue
>(initialContextValue);

export const useUniversalSearch = () => {
  return useContext(UniversalSearchContext);
};

interface IUniversalSearchProviderProps {
  controller: IUniversalSearcher;
  children: ReactNode;
}

const UniversalSearchProvider: React.FC<IUniversalSearchProviderProps> = ({
  children,
  controller,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialContextValue.searchTerm);
  const [results, setResults] = useState(initialContextValue.searchResults);

  const globalState = useSelector((state) => state);
  const filters = useRef(controller.getFilters());

  const debouncedResults = useDebounce(
    results,
    Constants.UNIVERSAL_SEARCH_UPDATE_DELAY_MS
  );

  const search = (term: string, type?: string) => {
    setSearchTerm(term);
    let newResults = initialContextValue.searchResults;
    if (searchTermRegex.test(term)) {
      newResults = controller.search(
        term,
        globalState,
        SEARCH_ITEMS_LIMIT,
        type as string
      );
    }
    setResults(newResults);
  };

  const contextValue: IUniversalSearchContextValue = {
    searchTerm,
    searchResults: debouncedResults,
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
