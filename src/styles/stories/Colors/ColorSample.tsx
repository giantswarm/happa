import contrast from 'get-contrast';
import { Box } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React, { ReactNode } from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';

/**
 * The ColorSample component is only used for Storybook purposes,
 * to display and explain our theme colors.
 */

const StyledDiv = styled.div`
  display: flex;
  width: 100px;
  height: 100px;
  justify-content: center;
  align-items: center;
  color: ${(props) => props.style?.color};
  background-color: ${(props) => props.style?.backgroundColor};
  border: 1px solid ${(props) => props.style?.color};
  font-family: Inconsolata, monospace;
`;

const MIN_CONTRAST_RATIO = 4.5;

interface IColorSampleProps {
  children: ReactNode;
  color: string;
  title?: string;
}

const ColorSample: React.FC<React.PropsWithChildren<IColorSampleProps>> = ({
  children,
  color,
  title,
}) => {
  const normalizedColor = normalizeColor(color, theme);
  const contrastRatio = contrast.ratio('white', normalizedColor);
  const contrastingColor =
    contrastRatio > MIN_CONTRAST_RATIO ? 'white' : 'black';

  return (
    <Box direction='row' pad='small'>
      <StyledDiv
        style={{ color: contrastingColor, backgroundColor: normalizedColor }}
      >
        {normalizedColor}
      </StyledDiv>
      <Box pad='medium'>
        <div>
          <strong>{title}</strong>
        </div>
        <div>{children}</div>
      </Box>
    </Box>
  );
};

ColorSample.defaultProps = {
  color: '#000000',
  title: '',
};

export default ColorSample;
