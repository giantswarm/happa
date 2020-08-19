import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearchFilterMap,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import * as React from 'react';
import UniversalSearchSuggestionItem from 'UniversalSearch/UniversalSearchSuggestionItem';
import UniversalSearchSuggestionItemPlaceholder from 'UniversalSearch/UniversalSearchSuggestionItemPlaceholder';

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
  user-select: none;
  opacity: ${({ isOpened }) => (isOpened ? 1 : 0)};
  visibility: ${({ isOpened }) => (isOpened ? 'visible' : 'hidden')};
  pointer-events: ${({ isOpened }) => (isOpened ? 'all' : 'none')};
`;

const SuggestionsList = styled.ul`
  list-style: none;
  padding: ${({ theme }) =>
    `${theme.spacingPx * 2}px ${theme.spacingPx * 3}px`};
  margin-bottom: 0;
`;

const AccessibilityHint = styled.div`
  display: none;
`;

interface IUniversalSearchSuggestionListProps
  extends React.ComponentPropsWithoutRef<'div'> {
  searchResults: IUniversalSearcherResult<unknown>[];
  searchTerm: string;
  filters: UniversalSearchFilterMap;
  selectedIndex?: number;
  onResultClick?: () => void;
  onResultHover?: (index: number) => void;
  isOpened?: boolean;
}

const UniversalSearchSuggestionList: React.FC<IUniversalSearchSuggestionListProps> = ({
  searchResults,
  searchTerm,
  filters,
  selectedIndex,
  onResultClick,
  onResultHover,
  isOpened,
  ...rest
}) => {
  const numOfResults = searchResults.length;

  return (
    <SuggestionsWrapper
      isOpened={isOpened}
      aria-hidden={isOpened ? 'false' : 'true'}
      {...rest}
    >
      <SuggestionsList role='listbox'>
        {numOfResults < 1 && <UniversalSearchSuggestionItemPlaceholder />}

        {searchResults.map((result, index) => {
          const currFilter = filters[result.type];

          return (
            <UniversalSearchSuggestionItem
              key={`${result.type}-${index}`}
              searchResult={result}
              searchTerm={searchTerm}
              renderer={currFilter.renderer}
              urlFactory={currFilter.urlFactory}
              isSelected={selectedIndex === index}
              onClick={onResultClick}
              onMouseEnter={() => onResultHover?.(index)}
              onMouseLeave={() => onResultHover?.(index)}
            />
          );
        })}

        <AccessibilityHint aria-live='polite' role='status'>
          {numOfResults} results available.
        </AccessibilityHint>
      </SuggestionsList>
    </SuggestionsWrapper>
  );
};

UniversalSearchSuggestionList.propTypes = {
  searchResults: PropTypes.array.isRequired,
  searchTerm: PropTypes.string.isRequired,
  // @ts-ignore
  filters: PropTypes.object.isRequired,
  selectedIndex: PropTypes.number,
  onResultClick: PropTypes.func,
  onResultHover: PropTypes.func,
  isOpened: PropTypes.bool,
};

UniversalSearchSuggestionList.defaultProps = {
  selectedIndex: -1,
  isOpened: false,
};

export default UniversalSearchSuggestionList;
