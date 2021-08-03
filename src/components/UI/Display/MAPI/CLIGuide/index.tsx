import {
  Accordion,
  AccordionPanel,
  Box,
  Text,
  ThemeContext,
  ThemeType,
} from 'grommet';
import PropTypes from 'prop-types';
import React from 'react';
import styled, { css } from 'styled-components';

const StyledAccordion = styled(Accordion)`
  code {
    background-color: transparent;
    font-size: 1em;
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
      fill: ${({ theme }) => theme.global.colors['text-weak'].dark};
      stroke: ${({ theme }) => theme.global.colors['text-weak'].dark};
    `,
  },
};

interface ICLIGuideProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Accordion>, 'title'> {
  title: React.ReactNode;
  footer?: React.ReactNode;
}

const CLIGuide: React.FC<ICLIGuideProps> = ({
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

CLIGuide.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  footer: PropTypes.node,
};

export default CLIGuide;
