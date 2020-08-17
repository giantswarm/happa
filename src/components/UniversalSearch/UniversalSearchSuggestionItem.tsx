import styled from '@emotion/styled';
import {
  IUniversalSearcherResult,
  UniversalSearcherRenderer,
  UniversalSearchURLFactory,
} from 'lib/UniversalSearcher/UniversalSearcher';
import PropTypes from 'prop-types';
import * as React from 'react';
import { Link } from 'react-router-dom';

const SuggestionItem = styled.li`
  & + & {
    margin-top: ${({ theme }) => theme.spacingPx * 2}px;
  }
`;

const SuggestionItemLink = styled(Link)`
  display: block;
  border-radius: ${({ theme }) => theme.border_radius};
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
  onHover?: () => void;
  isSelected?: boolean;
}

const UniversalSearchSuggestionItem: React.FC<IUniversalSearchSuggestionItemProps> = ({
  searchResult,
  searchTerm,
  renderer,
  urlFactory,
  onClick,
  onHover,
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
        onMouseEnter={onHover}
        onMouseLeave={onHover}
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
  onHover: PropTypes.func,
  isSelected: PropTypes.bool,
};

UniversalSearchSuggestionItem.defaultProps = {
  isSelected: false,
};

export default UniversalSearchSuggestionItem;
