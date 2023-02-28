import { Text } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { RUMActions } from 'model/constants/realUserMonitoring';
import React, { FC } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import styled from 'styled-components';
import { TableCell, TableRow } from 'UI/Display/Table';
import RadioInput from 'UI/Inputs/RadioInput';
import { useInstanceTypeSelectionLabels } from 'utils/hooks/useInstanceTypeSelectionConfiguration';

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
  background: ${(props) =>
    props['aria-checked'] && normalizeColor('background-front', props.theme)};

  :hover {
    background: ${(props) =>
      !props['aria-checked'] &&
      normalizeColor('background-contrast', props.theme)};
  }

  .button-wrapper {
    margin-right: 0;
  }
`;

const Name = styled(Text)`
  font-family: ${({ theme }) => theme.fontFamilies.console};
`;

interface IInstanceTypeRow {
  isSelected: boolean;
  name: string;
  cpu?: string;
  ram?: string;
  description?: string;

  selectInstanceType(instanceType: string): void;
}

const InstanceTypeRow: FC<React.PropsWithChildren<IInstanceTypeRow>> = ({
  cpu,
  ram,
  name,
  description,
  isSelected,
  selectInstanceType,
}) => {
  const { singular } = useInstanceTypeSelectionLabels();

  const handleTabSelect = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      selectInstanceType(name);
    }
  };

  return (
    <StyledTableRow
      onClick={() => selectInstanceType(name)}
      tabIndex={isSelected ? -1 : 0}
      role='radio'
      aria-checked={isSelected}
      onKeyDown={handleTabSelect}
      aria-label={`${singular} ${name}`}
    >
      <TableCell>
        <RUMActionTarget name={RUMActions.SelectInstanceType}>
          <RadioInput
            id={`select-${name}`}
            title={`Select ${name}`}
            checked={isSelected}
            value={isSelected ? 'true' : 'false'}
            name={`select-${name}`}
            onChange={() => selectInstanceType(name)}
            formFieldProps={{
              margin: 'none',
            }}
            tabIndex={-1}
          />
        </RUMActionTarget>
      </TableCell>
      <TableCell>
        <Name>{name}</Name>
      </TableCell>
      <TableCell align='center'>{cpu && <Text>{cpu}</Text>}</TableCell>
      <TableCell width='xsmall' align='center'>
        {ram && <Text>{ram} GB</Text>}
      </TableCell>
      <TableCell>
        <Text>{description}</Text>
      </TableCell>
    </StyledTableRow>
  );
};

export default InstanceTypeRow;
