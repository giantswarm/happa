import PropTypes from 'prop-types';
import React from 'react';
import ImgWithFallback from 'shared/ImgWithFallback';
import styled from 'styled-components';
import theme from 'styles/theme';
import CachingColorHash from 'utils/cachingColorHash';

const colorHash = new CachingColorHash();

function acronymize(text: string) {
  // Example word: g8s-prometheus
  const matches = text.match(/\b(\w)/g); // ['g','p']
  if (matches === null) {
    return '';
  }

  // In case we don't two words, take the first two letters and make only
  // the first one capital.
  if (matches.length === 1) {
    return text[0].toUpperCase() + text[1];
  }

  // If we have multiple words, than return the first letter of the first two words capitalised.
  const acronym = matches.slice(0, 2).join('').toUpperCase(); // GP

  return acronym;
}

interface IStyledImageWithFallbackProps {
  outlinecolor: string;
}

const StyledImageWithFallback = styled(
  ImgWithFallback
)<IStyledImageWithFallbackProps>`
  font-size: 40px;
  align-items: center;
  font-weight: 800;
  justify-content: center;
  text-shadow: -1px -1px 0 ${({ outlinecolor }) => outlinecolor},
    1px -1px 0 ${({ outlinecolor }) => outlinecolor},
    -1px 1px 0 ${({ outlinecolor }) => outlinecolor},
    1px 1px 0 ${({ outlinecolor }) => outlinecolor};
`;

interface IIconProps {
  name: string;
  src: string;
}

const Icon: React.FC<IIconProps> = ({ name, src }) => {
  return (
    <StyledImageWithFallback
      outlinecolor={colorHash.calculateColor(name)}
      src={src}
      alt={name}
      fallback={{
        label: acronymize(name),
        backgroundColor: 'transparent',
        textColor: theme.colors.darkBlueDarker4,
      }}
      title={name}
    />
  );
};

Icon.propTypes = {
  name: PropTypes.string.isRequired,
  src: PropTypes.string.isRequired,
};

export default Icon;
