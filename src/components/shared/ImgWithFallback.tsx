import React, {
  FC,
  ImgHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from 'react';

interface IFallback {
  label: string;
  backgroundColor: string;
  textColor: string;
}

interface IImgWithFallback extends ImgHTMLAttributes<HTMLImageElement> {
  fallback: IFallback;
}

const ImgWithFallback: FC<IImgWithFallback> = (props) => {
  const { fallback, src, ...restProps } = props;

  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(typeof src !== 'undefined');

  const isMounted = useRef<boolean>(true);

  useEffect(() => {
    const loadImage = async (imageSrc: string) => {
      try {
        const image = new Image();
        image.src = imageSrc;
        await image.decode();

        setLoading(false);
      } catch {
        if (isMounted.current) {
          setLoading(false);
          setLoadError(true);
        }
      }
    };
    if (src) loadImage(src);

    return () => {
      isMounted.current = false;
    };
  }, [src]);

  return loading ? null : loadError || !src ? (
    <div
      {...restProps}
      style={{
        backgroundColor: fallback.backgroundColor,
        color: fallback.textColor,
      }}
    >
      {fallback.label}
    </div>
  ) : (
    <img {...restProps} src={src} />
  );
};

export default ImgWithFallback;
