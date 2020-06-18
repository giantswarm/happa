import styled from '@emotion/styled';
import { IInstanceType } from 'hooks/useInstanceTypeSelectionConfiguration';
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import { CursorPointerCell, Tr } from 'UI/ExpandableSelector/Items';
import RadioInput from 'UI/Inputs/RadioInput';

interface IInstanceTypeRow extends IInstanceType {
  isSelected: boolean;
  selectInstanceType(instanceType: string): void;
}

const LeftAlignedCell = styled(CursorPointerCell)`
  text-align: left;
`;

const InstanceTypeRow: FC<IInstanceTypeRow> = ({
  cpu,
  ram,
  name,
  description,
  isSelected,
  selectInstanceType,
}) => {
  return (
    <Tr isSelected={isSelected} onClick={() => selectInstanceType(name)}>
      <LeftAlignedCell>
        <RadioInput
          id={`select-${name}`}
          title={`Select TODO ${name}`}
          checked={isSelected}
          value={isSelected ? 'true' : 'false'}
          name={`select-${name}`}
          onChange={() => selectInstanceType(name)}
          rootProps={{ className: 'selection-radio' }}
          bulletProps={{ className: 'selection-bullet' }}
        />
      </LeftAlignedCell>
      <CursorPointerCell>{name}</CursorPointerCell>
      <CursorPointerCell>{cpu}</CursorPointerCell>
      <CursorPointerCell>{ram} GB</CursorPointerCell>
      <LeftAlignedCell>{description}</LeftAlignedCell>
    </Tr>
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
