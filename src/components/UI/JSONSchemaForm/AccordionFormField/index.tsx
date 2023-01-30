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

const StyledLabel = styled(Text).attrs({
  forwardedAs: 'label',
})`
  cursor: pointer;
`;

const leftPadding = '35px';

interface AccordionFormFieldProps {
  label: React.ReactNode;
  help?: React.ReactNode;
  error?: React.ReactNode;
}

const AccordionFormField: React.FC<
  React.PropsWithChildren<AccordionFormFieldProps>
> = ({ label, help, error, children }) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const isExpanded = activeIndexes.length !== 0;

  const helpComponent =
    typeof help === 'string' ? <Text color='text-weak'>{help}</Text> : help;

  return (
    <Accordion
      activeIndex={activeIndexes}
      onActive={setActiveIndexes}
      animate={false}
    >
      <AccordionPanel
        header={
          <Box direction='row' align='top'>
            <Box width={leftPadding} margin={{ vertical: 'small' }}>
              <Icon
                className='fa fa-chevron-down'
                isActive={isExpanded}
                role='presentation'
                aria-hidden='true'
              />
            </Box>
            <Box>
              <StyledLabel weight='bold' margin={{ vertical: 'small' }}>
                {label}
              </StyledLabel>
              {help && isExpanded && (
                <Box margin={{ bottom: 'small' }}>{helpComponent}</Box>
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
