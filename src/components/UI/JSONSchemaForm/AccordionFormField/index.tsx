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
  hasChildErrors?: boolean;
}

const AccordionFormField: React.FC<
  React.PropsWithChildren<AccordionFormFieldProps>
> = ({ label, help, error, hasChildErrors, children }) => {
  const [activeIndexes, setActiveIndexes] = useState<number[]>([]);
  const isExpanded = activeIndexes.length !== 0;

  const handleActive = (indices: number[]) => {
    setActiveIndexes(indices);
  };

  return (
    <Accordion
      activeIndex={activeIndexes}
      onActive={handleActive}
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
                {hasChildErrors && !isExpanded && (
                  <Text
                    size='large'
                    color='status-danger'
                    margin={{ left: 'small' }}
                  >
                    <i
                      className='fa fa-warning'
                      role='presentation'
                      aria-hidden='true'
                    />
                  </Text>
                )}
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
