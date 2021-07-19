import { Keyboard } from 'grommet';
import {
  useAllowedInstanceTypes,
  useInstanceTypeCapabilities,
  useInstanceTypeSelectionLabels,
} from 'lib/hooks/useInstanceTypeSelectionConfiguration';
import PropTypes from 'prop-types';
import React, { FC, useState } from 'react';
import RUMActionTarget from 'RUM/RUMActionTarget';
import { RUMActions } from 'shared/constants/realUserMonitoring';
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

import InstanceTypeRow from './InstanceTypeRow';

interface IInstanceTypeSelector {
  selectInstanceType(instanceType: string): void;

  selectedInstanceType: string;
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

const InstanceTypeSelector: FC<IInstanceTypeSelector> = ({
  selectInstanceType,
  selectedInstanceType,
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

  return (
    <>
      <SelectedWrapper>
        <SelectedInstanceTypeItem
          aria-label={`The currently selected ${singular} is ${selectedInstanceType}`}
        >
          <SelectedInstanceType>{selectedInstanceType}</SelectedInstanceType>
        </SelectedInstanceTypeItem>
        <SelectedDescription>
          {`${cpu} CPU cores, ${ram} GB RAM each`}
        </SelectedDescription>
      </SelectedWrapper>
      <div>
        <RUMActionTarget
          name={
            collapsed
              ? RUMActions.ExpandInstanceTypes
              : RUMActions.CollapseInstanceTypes
          }
        >
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
        </RUMActionTarget>
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

InstanceTypeSelector.propTypes = {
  selectInstanceType: PropTypes.func.isRequired,
  selectedInstanceType: PropTypes.string.isRequired,
};

export default InstanceTypeSelector;
