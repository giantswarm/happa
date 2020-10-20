import styled from '@emotion/styled';
import AddNodePoolAZSelectionCheckbox from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolAZSelectionCheckbox';
import { AvailabilityZoneSelection } from 'Cluster/ClusterDetail/AddNodePool/AddNodePoolUtils';
import AvailabilityZonesParser from 'Cluster/ClusterDetail/AvailabilityZonesParser';
import PropTypes from 'prop-types';
import * as React from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import PanelCollapse from 'react-bootstrap/lib/PanelCollapse';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';

const AZSelectionLabel = styled(ClusterCreationLabelSpan)`
  display: block;
`;

const StyledPanel = styled(Panel)`
  background: transparent;
  border-width: 0;
  margin-bottom: ${({ theme }) => theme.spacingPx * 3}px;
`;

const StyledPanelCollapse = styled(PanelCollapse)`
  font-size: 14px;
  padding: ${({ theme }) => theme.spacingPx * 2}px 0 0
    ${({ theme }) => theme.spacingPx * 7}px;
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  will-change: opacity, height, transform;
  transition: opacity 0.1s ease-in-out 0s,
    height 0.25s cubic-bezier(0.48, 0.28, 0.36, 1.02),
    transform 0.25s cubic-bezier(0.48, 0.28, 0.36, 1.02);

  &.in {
    margin-bottom: ${({ theme }) => theme.spacingPx * 7}px;
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: opacity 0.25s ease-in-out 0.05s,
      height 0.25s cubic-bezier(0.48, 0.28, 0.36, 1.02),
      transform 0.25s cubic-bezier(0.48, 0.28, 0.36, 1.02);
  }
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 400;
  margin-bottom: 0;
`;

const AZSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacingPx * 5}px;
  margin-bottom: ${({ theme }) => theme.spacingPx * 2}px;
`;

const ManualAZSelector = styled.div`
  font-size: 16px;
`;

interface IAddNodePoolAZSelectionProps {
  onChange: (newAZSelection: AvailabilityZoneSelection) => void;
  onUpdateZones: (payload: { value: number; valid: boolean }) => void;

  // Common.
  value?: AvailabilityZoneSelection;
  npID?: string;

  // Manual and automatic modes.
  allZones?: string[];
  minNumOfZones?: number;
  maxNumOfZones?: number;
  defaultNumOfZones?: number;

  // Automatic mode only.
  numOfZones?: number;

  // Manual mode only.
  selectedZones?: string[];
}

const AddNodePoolAZSelection: React.FC<IAddNodePoolAZSelectionProps> = ({
  onChange,
  onUpdateZones,
  value,
  npID,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  numOfZones,
  selectedZones,
}) => {
  /**
   * The `onToggle` prop is required because otherwise, the `Panel` component
   * throws an error saying that our component should be uncontrolled and have
   * a `defaultExpanded` prop. We don't need to use the `onToggle` prop to
   * change anything, because we change the state based on the checked checkbox.
   */
  const onToggleFakeCallback = () => {};

  let automaticAZSelectionMessage =
    'Availability zones will be selected randomly.';
  if ((numOfZones as number) < 2) {
    automaticAZSelectionMessage = `Covering one availability zone, the worker nodes of this node pool will be placed in the same availability zone as the cluster's master node.`;
  }

  let manualAZSelectionErrorMessage = '';
  if ((selectedZones as string[]).length < 1) {
    manualAZSelectionErrorMessage = 'Please select at least one.';
  } else if ((selectedZones as string[]).length > (maxNumOfZones as number)) {
    const zoneCountDiff =
      (selectedZones as string[]).length - (maxNumOfZones as number);
    manualAZSelectionErrorMessage = `${maxNumOfZones} is the maximum you can have. Please uncheck at least ${zoneCountDiff} of them.`;
  }

  return (
    <div>
      <AZSelectionLabel>Availability Zones selection</AZSelectionLabel>
      <StyledPanel
        expanded={value === AvailabilityZoneSelection.Automatic}
        onToggle={onToggleFakeCallback}
      >
        <AddNodePoolAZSelectionCheckbox
          onChange={onChange}
          value={value}
          npID={npID}
          type={AvailabilityZoneSelection.Automatic}
        />
        <StyledPanelCollapse>
          <AZSelectorWrapper>
            <p>Number of availability zones to use:</p>
            <AvailabilityZonesParser
              min={minNumOfZones}
              max={maxNumOfZones}
              defaultValue={defaultNumOfZones}
              zones={allZones}
              updateAZValuesInParent={onUpdateZones}
              isLabels={false}
            />
          </AZSelectorWrapper>
          <p>{automaticAZSelectionMessage}</p>
        </StyledPanelCollapse>
      </StyledPanel>
      <StyledPanel
        expanded={value === AvailabilityZoneSelection.Manual}
        onToggle={onToggleFakeCallback}
      >
        <AddNodePoolAZSelectionCheckbox
          onChange={onChange}
          value={value}
          npID={npID}
          type={AvailabilityZoneSelection.Manual}
        />
        <StyledPanelCollapse>
          <p>
            You can select up to {maxNumOfZones} availability zones to make use
            of.
          </p>
          <AZSelectorWrapper>
            <ManualAZSelector>
              <AvailabilityZonesParser
                min={minNumOfZones}
                max={maxNumOfZones}
                defaultValue={2}
                zones={allZones}
                updateAZValuesInParent={onUpdateZones}
                isLabels={true}
              />
            </ManualAZSelector>

            {manualAZSelectionErrorMessage && (
              <ErrorMessage>{manualAZSelectionErrorMessage}</ErrorMessage>
            )}
          </AZSelectorWrapper>
        </StyledPanelCollapse>
      </StyledPanel>
      <StyledPanel
        expanded={value === AvailabilityZoneSelection.None}
        onToggle={onToggleFakeCallback}
      >
        <AddNodePoolAZSelectionCheckbox
          onChange={onChange}
          value={value}
          npID={npID}
          type={AvailabilityZoneSelection.None}
        />
        <StyledPanelCollapse>
          <p>
            To increase the chances of finding available GPU instances, this
            option allows not setting a specific availability zone.
          </p>
        </StyledPanelCollapse>
      </StyledPanel>
    </div>
  );
};

AddNodePoolAZSelection.propTypes = {
  onUpdateZones: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  value: PropTypes.number,
  npID: PropTypes.string,
  allZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  minNumOfZones: PropTypes.number,
  maxNumOfZones: PropTypes.number,
  defaultNumOfZones: PropTypes.number,
  numOfZones: PropTypes.number,
  selectedZones: PropTypes.arrayOf(PropTypes.string.isRequired),
};

AddNodePoolAZSelection.defaultProps = {
  value: AvailabilityZoneSelection.Automatic,
  npID: '',
  allZones: [],
  minNumOfZones: 0,
  maxNumOfZones: 0,
  defaultNumOfZones: 0,
  numOfZones: 0,
  selectedZones: [],
};

export default AddNodePoolAZSelection;
