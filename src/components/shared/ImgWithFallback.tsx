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

const ImgWithFallback: FC<React.PropsWithChildren<IImgWithFallback>> = (
  props
) => {
  const { fallback, src, ...restProps } = props;
  const [loadError, setLoadError] = useState(true);
  const [loading, setLoading] = useState(true);

  const isMounted = useRef<boolean>(false);
  useEffect(() => {
    isMounted.current = true;
    const loadImage = async (imageSrc: string) => {
      try {
        const image = new Image();
        image.src = imageSrc;
        await image.decode();
        if (isMounted.current) {
          setLoadError(false);
          setLoading(false);
        }
      } catch {
        if (isMounted.current) {
          setLoadError(true);
          setLoading(false);
        }
      }
    };
    if (src) loadImage(src);

    return () => {
      isMounted.current = false;
    };
  }, [src]);

  if (loading && src) return null;

  return loadError || !src ? (
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
