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
  const { plural } = useInstanceTypeSelectionLabels();
  const { cpu, ram } = useInstanceTypeCapabilities(selectedInstanceType);
  const allowedInstanceTypes = useAllowedInstanceTypes();

  return (
    <>
      <SelectedWrapper>
        <SelectedInstanceTypeItem>
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
            onClick={() => setCollapsed(!collapsed)}
            collapsible={true}
            title={`Show/hide available ${plural}`}
          >
            <i className={`fa fa-caret-${collapsed ? 'right' : 'bottom'}`} />
            Available {plural}
          </ListToggler>
        </RUMActionTarget>
      </div>
      {!collapsed && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell />
              <TableCell>Name</TableCell>
              <TableCell align='center'>CPU</TableCell>
              <TableCell align='center'>Memory</TableCell>
              <TableCell>Description</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
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
      )}
    </>
  );
};

InstanceTypeSelector.propTypes = {
  selectInstanceType: PropTypes.func.isRequired,
  selectedInstanceType: PropTypes.string.isRequired,
};

export default InstanceTypeSelector;
