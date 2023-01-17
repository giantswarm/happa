import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import React, { useState } from 'react';
import styled from 'styled-components';

const Icon = styled(Text)<{ isActive?: boolean }>`
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: 0.15s ease-out;
  font-size: 28px;
  line-height: 20px;
  margin-left: -6px;
`;

interface AccordionFormFieldProps {
  label: string;
  help?: string;
  error?: React.ReactNode;
}

const AccordionFormField: React.FC<
  React.PropsWithChildren<AccordionFormFieldProps>
> = ({ label, help, error, children }) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);

  return (
    <Accordion
      activeIndex={activeIndexes}
      onActive={setActiveIndexes}
      animate={false}
    >
      <AccordionPanel
        header={
          <Box>
            <Box direction='row' align='center' margin={{ vertical: 'small' }}>
              <Icon
                className='fa fa-chevron-down'
                isActive={activeIndexes.includes(0)}
                role='presentation'
                aria-hidden='true'
              />
              <Text weight='bold'>{label}</Text>
            </Box>
            {help && (
              <Text size='small' color='text-weak' margin={{ bottom: 'small' }}>
                {help}
              </Text>
            )}
            {error && <Box margin={{ bottom: 'small' }}>{error}</Box>}
          </Box>
        }
      >
        <Box
          border='all'
          pad={{ vertical: 'small', horizontal: 'medium' }}
          round='xsmall'
          margin={{
            bottom: 'medium',
          }}
        >
          {children}
        </Box>
      </AccordionPanel>
    </Accordion>
  );
};

export default AccordionFormField;
