import React, { FC, ImgHTMLAttributes, useState } from 'react';

interface IFallback {
  label: string;
  backgroundColor: string;
  textColor: string;
}

interface IImgWithFallback extends ImgHTMLAttributes<HTMLImageElement> {
  fallback: IFallback;
}

const ImgWithFallback: FC<IImgWithFallback> = (props) => {
  const [loadError, setLoadError] = useState(true);
  const [loading, setLoading] = useState(true);

  const { fallback, ...restProps } = props;

  if (loading && restProps.src) {
    return (
      <img
        {...restProps}
        onError={() => {
          setLoadError(true);
          setLoading(false);
        }}
        onLoad={() => {
          setLoadError(false);
          setLoading(false);
        }}
        style={{ opacity: 0 }}
      />
    );
  }

  if (loadError || !restProps.src) {
    return (
      <div
        {...restProps}
        style={{
          backgroundColor: fallback.backgroundColor,
          color: fallback.textColor,
        }}
      >
        {fallback.label}
      </div>
    );
  }

  return <img {...restProps} onLoad={() => setLoadError(false)} />;
};

export default ImgWithFallback;
