import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearcherRenderer,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Link } from 'react-router-dom';

const SuggestionItem = styled.li``;

const SuggestionItemLink = styled(Link)`
  box-sizing: border-box;
  line-height: initial;
  display: block;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker4};
  transition: 0.075s ease-out;

  &[aria-selected='true'],
  &:hover {
    background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  }

  &:active {
    background-color: ${({ theme }) => theme.colors.darkBlueDarker5};
  }
`;

interface IUniversalSearchSuggestionItemProps
  extends React.ComponentPropsWithoutRef<'li'> {
  searchResult: IUniversalSearcherResult<unknown>;
  searchTerm: string;
  renderer: UniversalSearcherRenderer<unknown>;
  isSelected?: boolean;
}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = ({
  searchResult,
  searchTerm,
  renderer,
  isSelected,
  ...rest
}) => {
  return (
    <SuggestionItem {...rest}>
      <SuggestionItemLink
        to=''
        role='option'
        tabIndex={-1}
        aria-selected={isSelected}
      >
        {renderer(searchResult.result, searchTerm, searchResult.type)}
      </SuggestionItemLink>
    </SuggestionItem>
  );
};

UniversalSearchSuggestionItem.propTypes = {
  // @ts-ignore
  searchResult: PropTypes.object.isRequired,
  searchTerm: PropTypes.string.isRequired,
  renderer: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
};

UniversalSearchSuggestionItem.defaultProps = {
  isSelected: false,
};

export default UniversalSearchSuggestionItem;
