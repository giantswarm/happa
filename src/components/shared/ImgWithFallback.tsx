import PropTypes from 'prop-types';
import React, { FC, ImgHTMLAttributes, useState } from 'react';

interface IImgWithFallback extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackStr: string;
}

const ImgWithFallback: FC<IImgWithFallback> = (props) => {
  const [loadError, setLoadError] = useState(false);

  if (loadError) {
    return <div {...props}>{props.fallbackStr}</div>;
  }

  return <img {...props} onError={() => setLoadError(true)} />;
};

ImgWithFallback.propTypes = {
  fallbackStr: PropTypes.string.isRequired,
};

export default ImgWithFallback;
