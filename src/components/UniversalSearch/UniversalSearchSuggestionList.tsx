import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import * as React from 'react';
import UniversalSearchSuggestionItem from 'UniversalSearch/UniversalSearchSuggestionItem';

const SuggestionsWrapper = styled.div`
  position: absolute;
  top: 100%;
  width: 100%;
  max-width: 800px;
  background: ${({ theme }) => theme.colors.darkBlueDarker4};
  z-index: 99;
  border-radius: ${({ theme }) =>
    `0 0 ${theme.border_radius} ${theme.border_radius}`};
  padding-top: 8px;
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding-left: 0;
`;

interface IUniversalSearchSuggestionListProps
  extends React.ComponentPropsWithoutRef<'div'> {
  searchResults: IUniversalSearcherResult<unknown>[];
  searchTerm: string;
  filters: UniversalSearchFilterMap;
}

const UniversalSearchSuggestionList: React.FC<IUniversalSearchSuggestionListProps> = ({
  searchResults,
  searchTerm,
  filters,
  ...rest
}) => {
  return (
    <SuggestionsWrapper {...rest}>
      <SuggestionsList role='listbox'>
        {searchResults.map((result, index) => (
          <UniversalSearchSuggestionItem
            key={getKeyFromResult(result, index)}
            id={getKeyFromResult(result, index)}
            searchResult={result}
            searchTerm={searchTerm}
            renderer={filters[result.type].renderer}
          />
        ))}
      </SuggestionsList>
    </SuggestionsWrapper>
  );
};

UniversalSearchSuggestionList.propTypes = {
  searchResults: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  // @ts-ignore
  filters: PropTypes.object.isRequired,
};

function getKeyFromResult(
  result: IUniversalSearcherResult<unknown>,
  index: number
): string {
  return `${result.type}-${index}`;
}

export default UniversalSearchSuggestionList;
