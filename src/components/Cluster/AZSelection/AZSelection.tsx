import { Box, Collapsible } from 'grommet';
import React from 'react';
import { Providers } from 'shared/constants';
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

const StyledPanelCollapse = styled(Box)`
  padding: ${({ theme }) => theme.spacingPx * 2}px 0 0
    ${({ theme }) => theme.spacingPx * 7}px;
  margin-bottom: ${({ theme }) => theme.spacingPx * 7}px;
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
  return (
    <div {...rest}>
      {maxNumOfZones! > 0 && (
        <>
          <AZSelectionCheckbox
            onChange={onChange}
            value={value}
            uniqueIdentifier={uniqueIdentifier}
            label='Automatic selection'
            type={AvailabilityZoneSelection.Automatic}
            baseActionName={baseActionName}
          />
          <Collapsible open={value === AvailabilityZoneSelection.Automatic}>
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
          </Collapsible>
          <AZSelectionCheckbox
            onChange={onChange}
            value={value}
            uniqueIdentifier={uniqueIdentifier}
            label='Manual selection'
            type={AvailabilityZoneSelection.Manual}
            baseActionName={baseActionName}
          />
          <Collapsible open={value === AvailabilityZoneSelection.Manual}>
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
          </Collapsible>
        </>
      )}

      {provider === Providers.AZURE && (
        <>
          <AZSelectionCheckbox
            onChange={onChange}
            value={value}
            uniqueIdentifier={uniqueIdentifier}
            label='Not specified'
            type={AvailabilityZoneSelection.NotSpecified}
            baseActionName={baseActionName}
          />

          <Collapsible open={value === AvailabilityZoneSelection.NotSpecified}>
            <StyledPanelCollapse>
              <AZSelectionNotSpecified variant={variant!} />
            </StyledPanelCollapse>
          </Collapsible>
        </>
      )}
    </div>
  );
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
