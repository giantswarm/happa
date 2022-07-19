import {
  Accordion,
  AccordionPanel,
  Box,
  Text,
  ThemeContext,
  ThemeType,
} from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React, { useState } from 'react';
import { css } from 'styled-components';

const customTheme: ThemeType = {
  icon: {
    // @ts-expect-error
    extend: css`
      fill: ${({ theme }) => normalizeColor('text-weak', theme)};
      stroke: ${({ theme }) => normalizeColor('text-weak', theme)};
    `,
  },
};

interface ICLIGuidesListProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Accordion>, 'title'> {
  title?: string;
}

const CLIGuidesList: React.FC<React.PropsWithChildren<ICLIGuidesListProps>> = ({
  children,
  title = 'Use the Management API to …',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <ThemeContext.Extend value={customTheme}>
      <Accordion
        onActive={(indices: number[]) => setIsExpanded(indices.length > 0)}
        basis='100%'
        round='xsmall'
        background={isExpanded ? 'accent-strong' : 'background-strong'}
        {...props}
      >
        <AccordionPanel
          label={
            <Box
              direction='row'
              align='center'
              pad='small'
              gap='xsmall'
              round='xsmall'
              background={isExpanded ? 'accent-strong' : 'background-strong'}
            >
              <Text
                className='fa fa-shell'
                role='presentation'
                aria-hidden={true}
                color='text-weak'
              />
              <Text weight='bold' color='text-weak'>
                {title}
              </Text>
            </Box>
          }
        >
          <Box
            basis='100%'
            margin={{ bottom: 'xsmall' }}
            pad='12px'
            gap='small'
          >
            {children &&
              React.Children.map(
                children,
                (child) =>
                  child &&
                  React.cloneElement(child as React.ReactElement, {
                    inList: true,
                  })
              )}
          </Box>
        </AccordionPanel>
      </Accordion>
    </ThemeContext.Extend>
  );
};

export default CLIGuidesList;
