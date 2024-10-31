import { Keyboard } from 'grommet';
import React, { FC, useState } from 'react';
import styled from 'styled-components';
import {
  ListToggler,
  SelectedDescription,
  SelectedItem,
  SelectedWrapper,
} from 'UI/Controls/ExpandableSelector/Selector';
import InstanceType from 'UI/Display/Cluster/InstanceType';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from 'UI/Display/Table';
import {
  useAllowedInstanceTypes,
  useInstanceTypeCapabilities,
  useInstanceTypeSelectionLabels,
} from 'utils/hooks/useInstanceTypeSelectionConfiguration';

import InstanceTypeRow from './InstanceTypeRow';

interface IInstanceTypeSelector {
  selectInstanceType(instanceType: string): void;

  selectedInstanceType: string;
  allowEmptyValue?: boolean;
  emptyValueName?: string;
}

const SelectedInstanceTypeItem = styled(SelectedItem)`
  margin-right: 0;
`;

const SelectedInstanceType = styled(InstanceType)`
  font-size: 16px;
  padding: 4px 16px;
  height: unset;
  line-height: unset;
`;

const EmptyValueWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacingPx * 2}px;
  line-height: 28px;
`;

const InstanceTypeSelector: FC<IInstanceTypeSelector> = ({
  selectInstanceType,
  selectedInstanceType,
  allowEmptyValue = false,
  emptyValueName = 'None',
}) => {
  const [collapsed, setCollapsed] = useState(true);
  const { singular, plural } = useInstanceTypeSelectionLabels();
  const { cpu, ram } = useInstanceTypeCapabilities(selectedInstanceType);
  const allowedInstanceTypes = useAllowedInstanceTypes();

  const handleTabSelect = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    // Handle tapping the space bar.
    if (e.key === ' ') {
      e.preventDefault();
      setCollapsed(!collapsed);
    }
  };

  const handleKeyDownCancel = (e: React.KeyboardEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setCollapsed(true);
  };

  const emptyValueIsSelected = selectedInstanceType === emptyValueName;

  return (
    <>
      {allowEmptyValue && emptyValueIsSelected ? (
        <EmptyValueWrapper>{emptyValueName}</EmptyValueWrapper>
      ) : (
        <SelectedWrapper>
          <SelectedInstanceTypeItem
            aria-label={`The currently selected ${singular} is ${selectedInstanceType}`}
          >
            <SelectedInstanceType>{selectedInstanceType}</SelectedInstanceType>
          </SelectedInstanceTypeItem>
          <SelectedDescription>{`${cpu} CPU cores, ${ram} GB RAM each`}</SelectedDescription>
        </SelectedWrapper>
      )}
      <div>
        <ListToggler
          role='button'
          id='machine-type-selector__toggler'
          aria-expanded={!collapsed}
          aria-labelledby='available-machines-label'
          tabIndex={0}
          onClick={() => setCollapsed(!collapsed)}
          collapsible={true}
          onKeyDown={handleTabSelect}
          title={`Show/hide available ${plural}`}
        >
          <i
            className={`fa fa-caret-${collapsed ? 'right' : 'bottom'}`}
            aria-hidden='true'
            aria-label='Toggle'
            role='presentation'
          />
          <span id='available-machines-label'>Available {plural}</span>
        </ListToggler>
      </div>
      {!collapsed && (
        <Keyboard onEsc={handleKeyDownCancel}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell />
                <TableCell>Name</TableCell>
                <TableCell align='center'>CPU</TableCell>
                <TableCell width='xsmall' align='center'>
                  Memory
                </TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody
              role='radiogroup'
              tabIndex={-1}
              aria-labelledby='machine-type-selector__toggler'
            >
              {allowEmptyValue && (
                <InstanceTypeRow
                  name={emptyValueName}
                  isSelected={emptyValueIsSelected}
                  selectInstanceType={selectInstanceType}
                />
              )}
              {allowedInstanceTypes.map((instanceType) => (
                <InstanceTypeRow
                  key={instanceType.name}
                  {...instanceType}
                  isSelected={instanceType.name === selectedInstanceType}
                  selectInstanceType={selectInstanceType}
                />
              ))}
            </TableBody>
          </Table>
        </Keyboard>
      )}
    </>
  );
};

export default InstanceTypeSelector;
