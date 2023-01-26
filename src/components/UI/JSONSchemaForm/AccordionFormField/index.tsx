import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';

const Icon = styled(Text)<{ isActive?: boolean }>`
  display: block;
  width: 28px;
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
  font-size: 28px;
`;

const leftPadding = '35px';

interface AccordionFormFieldProps {
  label: string;
  help?: string;
  error?: React.ReactNode;
}

const AccordionFormField: React.FC<
  React.PropsWithChildren<AccordionFormFieldProps>
> = ({ label, help, error, children }) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const isExpanded = activeIndexes.length !== 0;

  return (
    <Accordion
      activeIndex={activeIndexes}
      onActive={setActiveIndexes}
      animate={false}
    >
      <AccordionPanel
        header={
          <Box direction='row' align='top' margin={{ vertical: 'small' }}>
            <Box width={leftPadding}>
              <Icon
                className='fa fa-chevron-down'
                isActive={activeIndexes.includes(0)}
                role='presentation'
                aria-hidden='true'
              />
            </Box>
            <Box>
              <Text size='large' weight='bold'>
                {label}
              </Text>
              {help && isExpanded && (
                <Text color='text-weak' margin={{ top: 'small' }}>
                  {help}
                </Text>
              )}
              {error && <Box margin={{ bottom: 'small' }}>{error}</Box>}
            </Box>
          </Box>
        }
      >
        <Box pad={{ left: leftPadding }}>{children}</Box>
      </AccordionPanel>
    </Accordion>
  );
};

export default AccordionFormField;
