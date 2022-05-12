import { Box } from 'grommet';
import React, { ReactNode } from 'react';
import styled from 'styled-components';

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

interface IColorSampleProps {
  children: ReactNode;
  color: string;
  contrastingColor?: string;
  title?: string;
}

const ColorSample: React.FC<React.PropsWithChildren<IColorSampleProps>> = ({
  children,
  color,
  contrastingColor,
  title,
}) => {
  return (
    <Box direction='row' pad='small'>
      <StyledDiv style={{ color: contrastingColor, backgroundColor: color }}>
        {color}
      </StyledDiv>
      <Box pad='medium'>
        <div>
          <strong>{title}</strong>
        </div>
        <div>
          <p>{children}</p>
        </div>
      </Box>
    </Box>
  );
};

ColorSample.defaultProps = {
  color: '#000000',
  contrastingColor: '#ffffff',
  title: '',
};

export default ColorSample;
