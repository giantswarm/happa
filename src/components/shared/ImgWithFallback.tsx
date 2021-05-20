import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';

const Image = styled.img`
  opacity: 0;
`;

const LabelWrapper = styled.div<{ backgroundColor: string; textColor: string }>`
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ textColor }) => textColor};
`;

interface IFallback {
  label: string;
  backgroundColor: string;
  textColor: string;
}

interface IImgWithFallbackProps extends React.ComponentPropsWithoutRef<'img'> {
  fallback: IFallback;
}

const ImgWithFallback: React.FC<IImgWithFallbackProps> = (props) => {
  const [loadError, setLoadError] = useState(true);
  const [loading, setLoading] = useState(true);

  const { fallback, ...restProps } = props;

  if (loading && restProps.src) {
    return (
      <Image
        key='image'
        {...restProps}
        onError={() => {
          setLoadError(true);
          setLoading(false);
        }}
        onLoad={() => {
          setLoadError(false);
          setLoading(false);
        }}
      />
    );
  }

  if (loadError || !restProps.src) {
    return (
      <LabelWrapper
        key='label'
        {...restProps}
        backgroundColor={fallback.backgroundColor}
        textColor={fallback.textColor}
      >
        {fallback.label}
      </LabelWrapper>
    );
  }

  return <img key='image' {...restProps} onLoad={() => setLoadError(false)} />;
};

ImgWithFallback.propTypes = {
  fallback: PropTypes.shape({
    label: PropTypes.string.isRequired,
    backgroundColor: PropTypes.string.isRequired,
    textColor: PropTypes.string.isRequired,
  }).isRequired,
};

export default ImgWithFallback;
