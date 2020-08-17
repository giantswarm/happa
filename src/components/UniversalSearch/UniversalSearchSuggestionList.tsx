import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import * as React from 'react';
import UniversalSearchSuggestionItem from 'UniversalSearch/UniversalSearchSuggestionItem';

const SuggestionsWrapper = styled.div<{ isOpened?: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 100%;
  max-width: 800px;
  background: ${({ theme }) => theme.colors.darkBlueDarker4};
  z-index: 99;
  border-radius: ${({ theme }) =>
    `0 0 ${theme.border_radius} ${theme.border_radius}`};
  padding-top: 8px;
  user-select: none;
  opacity: ${({ isOpened }) => (isOpened ? 1 : 0)};
  visibility: ${({ isOpened }) => (isOpened ? 'visible' : 'hidden')};
  pointer-events: ${({ isOpened }) => (isOpened ? 'all' : 'none')};
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
  isOpened?: boolean;
}

const UniversalSearchSuggestionList: React.FC<IUniversalSearchSuggestionListProps> = ({
  searchResults,
  searchTerm,
  filters,
  isOpened,
  ...rest
}) => {
  return (
    <SuggestionsWrapper isOpened={isOpened} {...rest}>
      <SuggestionsList role='listbox'>
        {searchResults.map((result, index) => (
          <UniversalSearchSuggestionItem
            key={getKeyFromResult(result, index)}
            id={getKeyFromResult(result, index)}
            searchResult={result}
            searchTerm={searchTerm}
            renderer={filters[result.type].renderer}
            isSelected={false}
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
  isOpened: PropTypes.bool,
};

UniversalSearchSuggestionList.defaultProps = {
  isOpened: false,
};

function getKeyFromResult(
  result: IUniversalSearcherResult<unknown>,
  index: number
): string {
  return `${result.type}-${index}`;
}

export default UniversalSearchSuggestionList;
