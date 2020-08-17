import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearcherRenderer,
  UniversalSearchURLFactory,
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
  urlFactory: UniversalSearchURLFactory<unknown>;
  onClick?: () => void;
  isSelected?: boolean;
}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = ({
  searchResult,
  searchTerm,
  renderer,
  urlFactory,
  onClick,
  isSelected,
  ...rest
}) => {
  return (
    <SuggestionItem {...rest}>
      <SuggestionItemLink
        to={urlFactory(searchResult.result, searchTerm)}
        role='option'
        tabIndex={-1}
        aria-selected={isSelected}
        onClick={onClick}
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
  urlFactory: PropTypes.func.isRequired,
  onClick: PropTypes.func,
  isSelected: PropTypes.bool,
};

UniversalSearchSuggestionItem.defaultProps = {
  isSelected: false,
};

export default UniversalSearchSuggestionItem;
