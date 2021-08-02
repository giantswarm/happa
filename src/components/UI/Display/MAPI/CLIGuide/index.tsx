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
import { css } from 'styled-components';

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
  extends React.ComponentPropsWithoutRef<typeof Accordion> {
  title: string;
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
      <Accordion background='background-contrast' round='xsmall' {...props}>
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
      </Accordion>
    </ThemeContext.Extend>
  );
};

CLIGuide.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  footer: PropTypes.node,
};

export default CLIGuide;
