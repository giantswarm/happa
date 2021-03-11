import { IInstanceType } from 'lib/hooks/useInstanceTypeSelectionConfiguration';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
import styled from 'styled-components';
import { TableCell, TableRow } from 'UI/Display/Table';
import RadioInput from 'UI/Inputs/RadioInput';

const StyledTableRow = styled(TableRow)`
  cursor: pointer;
  background: ${(props) =>
    props['aria-checked'] &&
    props.theme.global.colors['background-front'].dark};

  :hover {
    background: ${(props) =>
      !props['aria-checked'] &&
      props.theme.global.colors['background-contrast'].dark};
  }

  .button-wrapper {
    margin-right: 0;
  }
`;

interface IInstanceTypeRow extends IInstanceType {
  isSelected: boolean;

  selectInstanceType(instanceType: string): void;
}

const InstanceTypeRow: FC<IInstanceTypeRow> = ({
  cpu,
  ram,
  name,
  description,
  isSelected,
  selectInstanceType,
}) => {
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
      <TableCell>{name}</TableCell>
      <TableCell align='center'>{cpu}</TableCell>
      <TableCell align='center'>{ram} GB</TableCell>
      <TableCell>{description}</TableCell>
    </StyledTableRow>
  );
};

InstanceTypeRow.propTypes = {
  cpu: PropTypes.string.isRequired,
  ram: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  selectInstanceType: PropTypes.func.isRequired,
};

export default InstanceTypeRow;
