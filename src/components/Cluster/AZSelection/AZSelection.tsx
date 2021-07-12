import PropTypes from 'prop-types';
import * as React from 'react';
import Panel from 'react-bootstrap/lib/Panel';
import PanelCollapse from 'react-bootstrap/lib/PanelCollapse';
import { Providers } from 'shared/constants';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';

import AZSelectionAutomatic from './AZSelectionAutomatic';
import AZSelectionCheckbox from './AZSelectionCheckbox';
import AZSelectionManual from './AZSelectionManual';
import AZSelectionNotSpecified from './AZSelectionNotSpecified';
import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
  AZSelectionZonesUpdater,
} from './AZSelectionUtils';

const StyledPanel = styled(Panel)`
  background: transparent;
  border-width: 0;
  margin-bottom: ${({ theme }) => theme.spacingPx * 3}px;
  box-shadow: none;
`;

const StyledPanelCollapse = styled(PanelCollapse)`
  padding: ${({ theme }) => theme.spacingPx * 2}px 0 0
    ${({ theme }) => theme.spacingPx * 7}px;
  opacity: 0;
  transform: translate3d(0, 30px, 0);
  will-change: opacity, height, transform;
  transition: opacity 0.1s ease-in-out,
    height 0.2s cubic-bezier(0.48, 0.28, 0.36, 1.02),
    transform 0.2s cubic-bezier(0.48, 0.28, 0.36, 1.02);

  &.in {
    margin-bottom: ${({ theme }) => theme.spacingPx * 7}px;
    opacity: 1;
    transform: translate3d(0, 0, 0);
    transition: opacity 0.15s ease-in-out,
      height 0.2s cubic-bezier(0.48, 0.28, 0.36, 1.02),
      transform 0.15s cubic-bezier(0.48, 0.28, 0.36, 1.02);
  }
`;

interface IAZSelectionProps
  extends Omit<React.ComponentPropsWithoutRef<'div'>, 'onChange'> {
  // Common.
  onChange: (newAZSelection: AvailabilityZoneSelection) => void;
  onUpdateZones: AZSelectionZonesUpdater;
  variant?: AZSelectionVariants;
  value?: AvailabilityZoneSelection;
  uniqueIdentifier?: string;
  provider?: PropertiesOf<typeof Providers>;
  baseActionName?: string;

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

const AZSelection: React.FC<IAZSelectionProps> = ({
  onChange,
  onUpdateZones,
  variant,
  value,
  uniqueIdentifier,
  provider,
  allZones,
  minNumOfZones,
  maxNumOfZones,
  defaultNumOfZones,
  numOfZones,
  selectedZones,
  baseActionName,
  ...rest
}) => {
  /**
   * The `onToggle` prop is required because otherwise, the `Panel` component
   * throws an error saying that our component should be uncontrolled and have
   * a `defaultExpanded` prop. We don't need to use the `onToggle` prop to
   * change anything, because we change the state based on the checked checkbox.
   */
  const onToggleFakeCallback = () => {};

  return (
    <div {...rest}>
      {maxNumOfZones! > 0 && (
        <>
          <StyledPanel
            expanded={value === AvailabilityZoneSelection.Automatic}
            onToggle={onToggleFakeCallback}
          >
            <AZSelectionCheckbox
              onChange={onChange}
              value={value}
              uniqueIdentifier={uniqueIdentifier}
              label='Automatic selection'
              type={AvailabilityZoneSelection.Automatic}
              baseActionName={baseActionName}
            />
            <StyledPanelCollapse>
              <AZSelectionAutomatic
                onUpdateZones={onUpdateZones}
                variant={variant!}
                allZones={allZones!}
                minNumOfZones={minNumOfZones!}
                maxNumOfZones={maxNumOfZones!}
                defaultNumOfZones={defaultNumOfZones!}
                numOfZones={numOfZones!}
              />
            </StyledPanelCollapse>
          </StyledPanel>
          <StyledPanel
            expanded={value === AvailabilityZoneSelection.Manual}
            onToggle={onToggleFakeCallback}
          >
            <AZSelectionCheckbox
              onChange={onChange}
              value={value}
              uniqueIdentifier={uniqueIdentifier}
              label='Manual selection'
              type={AvailabilityZoneSelection.Manual}
              baseActionName={baseActionName}
            />
            <StyledPanelCollapse>
              <AZSelectionManual
                onUpdateZones={onUpdateZones}
                variant={variant!}
                allZones={allZones!}
                minNumOfZones={minNumOfZones!}
                maxNumOfZones={maxNumOfZones!}
                defaultNumOfZones={defaultNumOfZones!}
                selectedZones={selectedZones!}
              />
            </StyledPanelCollapse>
          </StyledPanel>
        </>
      )}

      {provider === Providers.AZURE && (
        <StyledPanel
          expanded={value === AvailabilityZoneSelection.NotSpecified}
          onToggle={onToggleFakeCallback}
        >
          <AZSelectionCheckbox
            onChange={onChange}
            value={value}
            uniqueIdentifier={uniqueIdentifier}
            label='Not specified'
            type={AvailabilityZoneSelection.NotSpecified}
            baseActionName={baseActionName}
          />
          <StyledPanelCollapse>
            <AZSelectionNotSpecified variant={variant!} />
          </StyledPanelCollapse>
        </StyledPanel>
      )}
    </div>
  );
};

AZSelection.propTypes = {
  onChange: PropTypes.func.isRequired,
  onUpdateZones: PropTypes.func.isRequired,
  variant: PropTypes.number,
  value: PropTypes.number,
  uniqueIdentifier: PropTypes.string,
  provider: PropTypes.oneOf(Object.values(Providers)),
  baseActionName: PropTypes.string,

  allZones: PropTypes.arrayOf(PropTypes.string.isRequired),
  minNumOfZones: PropTypes.number,
  maxNumOfZones: PropTypes.number,
  defaultNumOfZones: PropTypes.number,

  numOfZones: PropTypes.number,

  selectedZones: PropTypes.arrayOf(PropTypes.string.isRequired),
};

AZSelection.defaultProps = {
  variant: AZSelectionVariants.Master,
  value: AvailabilityZoneSelection.Automatic,
  uniqueIdentifier: '',
  provider: Providers.AWS,
  baseActionName: '',

  allZones: [],
  minNumOfZones: 0,
  maxNumOfZones: 0,
  defaultNumOfZones: 0,

  numOfZones: 0,

  selectedZones: [],
};

export default AZSelection;
