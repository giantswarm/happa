import {
  Accordion,
  AccordionPanel,
  Box,
  Text,
  ThemeContext,
  ThemeType,
} from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React from 'react';
import styled, { css } from 'styled-components';

const StyledAccordion = styled(Accordion)`
  code {
    background-color: ${({ theme }) => normalizeColor('accent-strong', theme)};
    font-size: 1em;

    var {
      font-style: normal;
    }
  }
`;

const customTheme: ThemeType = {
  global: {
    colors: {
      text: 'text-weak',
    },
  },
  accordion: {
    border: false,
  },
  icon: {
    // @ts-expect-error
    extend: css`
      fill: ${({ theme }) => normalizeColor('text-weak', theme)};
      stroke: ${({ theme }) => normalizeColor('text-weak', theme)};
    `,
  },
};

interface ICLIGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Accordion>, 'title'> {
  title: React.ReactNode;
  footer?: React.ReactNode;
}

const CLIGuide: React.FC<React.PropsWithChildren<ICLIGuideProps>> = ({
  children,
  title,
  footer,
  ...props
}) => {
  return (
    <ThemeContext.Extend value={customTheme}>
      <StyledAccordion background='background-strong' round='xsmall' {...props}>
        <AccordionPanel
          label={
            <Box
              direction='row'
              gap='xsmall'
              align='center'
              pad={{ vertical: 'small', horizontal: 'small' }}
            >
              <Text
                className='fa fa-shell'
                role='presentation'
                aria-hidden={true}
              />
              <Text weight='bold'>{title}</Text>
            </Box>
          }
        >
          <Box
            pad={{ vertical: 'medium', horizontal: 'large' }}
            width={{ max: 'xlarge' }}
          >
            {children}

            {footer && (
              <Box
                border={{ side: 'top' }}
                pad={{ vertical: 'small' }}
                margin={{ top: 'medium' }}
              >
                {footer}
              </Box>
            )}
          </Box>
        </AccordionPanel>
      </StyledAccordion>
    </ThemeContext.Extend>
  );
};

export default CLIGuide;
