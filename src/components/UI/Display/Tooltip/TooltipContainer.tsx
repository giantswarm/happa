import React, { useRef, useState } from 'react';

interface ITooltipContainerProps {
  content: React.ReactNode;
  target?: React.RefObject<HTMLElement>;
}

const TooltipContainer: React.FC<
  React.PropsWithChildren<ITooltipContainerProps>
> = ({ content, target, children }) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const createdTargetRef = useRef<HTMLElement>(null);

  const tooltipTargetRef = target ?? createdTargetRef;

  const handleMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTooltipVisible(true);
  };

  return (
    <>
      {tooltipVisible &&
        React.cloneElement(content as React.ReactElement, {
          target: tooltipTargetRef,
        })}
      {children &&
        React.cloneElement(children as React.ReactElement, {
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

export default TooltipContainer;
