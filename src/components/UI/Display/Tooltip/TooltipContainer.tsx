import React, { useRef, useState } from 'react';

interface ITooltipContainerProps {
  content: React.ReactElement;
  target?: React.RefObject<HTMLElement>;
  show?: boolean;
  children?: React.ReactElement;
}

const TooltipContainer: React.FC<
  React.PropsWithChildren<React.PropsWithChildren<ITooltipContainerProps>>
> = ({ content, target, show, children }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const createdTargetRef = useRef<HTMLElement>(null);

  const tooltipTargetRef = target ?? createdTargetRef;

  const handleMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (show) setTooltipVisible(true);
  };

  return (
    <>
      {tooltipVisible &&
        show &&
        React.cloneElement(content, {
          target: tooltipTargetRef.current ?? undefined,
        })}
      {children &&
        React.cloneElement(children, {
          ref: tooltipTargetRef,
          'aria-describedby': tooltipVisible ? 'tooltip' : undefined,
          onMouseOver: handleMouseOver,
          onMouseLeave: () => setTooltipVisible(false),
          onFocus: () => setTooltipVisible(true),
          onBlur: () => setTooltipVisible(false),
        })}
    </>
  );
};

TooltipContainer.defaultProps = {
  show: true,
};

export default TooltipContainer;
