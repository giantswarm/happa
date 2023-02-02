import { Accordion, AccordionPanel, Box, Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import React, { useState } from 'react';
import styled, { css } from 'styled-components';

const Icon = styled(Text)<{ isActive?: boolean }>`
  display: block;
  width: 28px;
  transform: rotate(${({ isActive }) => (isActive ? '0deg' : '-90deg')});
  transform-origin: center center;
  transition: transform 0.15s ease-out;
  font-size: 28px;
`;

const StyledAccordion = styled(Accordion)`
  /* Button wrapper around Accordion Panel header */
  ${() => css`
    > div > button[aria-expanded] {
      align-self: flex-start;
    }
  `}
`;

const StyledHeader = styled(Box).attrs({
  direction: 'row',
  align: 'top',
  pad: {
    right: 'small',
  },
})`
  &:hover {
    color: ${({ theme }) => normalizeColor('text-strong', theme)};
  }
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

  const helpComponent =
    typeof help === 'string' ? <Text color='text-weak'>{help}</Text> : help;

  return (
    <StyledAccordion
      activeIndex={activeIndexes}
      onActive={handleActive}
      animate={false}
    >
      <AccordionPanel
        header={
          <StyledHeader>
            <Box width={leftPadding} margin={{ vertical: 'small' }}>
              <Icon
                className='fa fa-chevron-down'
                isActive={isExpanded}
                role='presentation'
                aria-hidden='true'
              />
            </Box>
            <StyledLabel weight='bold' margin={{ vertical: 'small' }}>
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
            </StyledLabel>
          </StyledHeader>
        }
      >
        <Box pad={{ left: leftPadding }}>
          {help && <Box margin={{ bottom: 'small' }}>{helpComponent}</Box>}
          {error && <Box margin={{ bottom: 'small' }}>{error}</Box>}
          {children}
        </Box>
      </AccordionPanel>
    </StyledAccordion>
  );
};

export default AccordionFormField;
