import * as React from 'react';
import RendererWrapper from 'UniversalSearch/filters/RendererWrapper';

interface IUniversalSearchSuggestionItemPlaceholderProps
  extends React.ComponentPropsWithoutRef<'li'> {}

const UniversalSearchSuggestionItemPlaceholder: React.FC<IUniversalSearchSuggestionItemPlaceholderProps> = ({
  ...rest
}) => {
  return (
    <li {...rest}>
      <RendererWrapper>No results found for your query.</RendererWrapper>
    </li>
  );
};

UniversalSearchSuggestionItemPlaceholder.propTypes = {};

export default UniversalSearchSuggestionItemPlaceholder;
