import AZSelection from 'Cluster/AZSelection/AZSelection';
import {
  AvailabilityZoneSelection,
  AZSelectionVariants,
  AZSelectionZonesUpdater,
  IUpdateZoneLabelsPayload,
} from 'Cluster/AZSelection/AZSelectionUtils';
import { determineRandomAZs, getSupportedAvailabilityZones } from 'MAPI/utils';
import { RUMActions } from 'model/constants/realUserMonitoring';
import React, { useEffect, useMemo, useState } from 'react';
import InputGroup from 'UI/Inputs/InputGroup';

import { computeControlPlaneNodesStats } from '../ClusterDetail/utils';
import {
  IClusterPropertyProps,
  withClusterControlPlaneNodeAZs,
} from './patches';

interface ICreateClusterControlPlaneNodeAZsProps
  extends IClusterPropertyProps,
    Omit<
      React.ComponentPropsWithoutRef<typeof InputGroup>,
      'onChange' | 'id'
    > {}

const CreateClusterControlPlaneNodeAZs: React.FC<ICreateClusterControlPlaneNodeAZsProps> =
  ({ id, cluster, controlPlaneNodes, onChange, ...props }) => {
    const [azSelector, setAzSelector] = useState(
      AvailabilityZoneSelection.Automatic
    );

    const provider = window.config.info.general.provider;
    const azStats = getSupportedAvailabilityZones();

    const value = useMemo(() => {
      return computeControlPlaneNodesStats(controlPlaneNodes).availabilityZones;
    }, [controlPlaneNodes]);

    const [manualZones, setManualZones] = useState<string[]>(value);
    const [manualZonesIsValid, setManualZonesIsValid] = useState(false);

    const handleZoneChange: AZSelectionZonesUpdater =
      (azSelection) => (payload) => {
        switch (azSelection) {
          case AvailabilityZoneSelection.Automatic:
            break;

          case AvailabilityZoneSelection.Manual:
            setManualZonesIsValid(payload.valid);
            setManualZones((payload as IUpdateZoneLabelsPayload).zonesArray);
            break;
        }
      };

    const handleChange = (selector: AvailabilityZoneSelection) => {
      setAzSelector(selector);
    };

    useEffect(() => {
      switch (azSelector) {
        case AvailabilityZoneSelection.Automatic:
          onChange({
            isValid: true,
            patch: withClusterControlPlaneNodeAZs(
              determineRandomAZs(1, azStats.all)
            ),
          });
          break;

        case AvailabilityZoneSelection.Manual:
          onChange({
            isValid: manualZonesIsValid,
            patch: withClusterControlPlaneNodeAZs(manualZones),
          });
          break;

        case AvailabilityZoneSelection.NotSpecified:
          onChange({
            isValid: true,
            patch: withClusterControlPlaneNodeAZs(undefined),
          });
          break;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [azSelector, manualZones, manualZonesIsValid]);

    return (
      <InputGroup
        htmlFor={id}
        label='Control plane availability zone'
        {...props}
      >
        <AZSelection
          variant={AZSelectionVariants.Master}
          baseActionName={RUMActions.SelectMasterAZSelection}
          value={azSelector}
          provider={provider}
          onChange={handleChange}
          minNumOfZones={azStats.minCount}
          maxNumOfZones={azStats.maxCount}
          defaultNumOfZones={azStats.defaultCount}
          allZones={azStats.all}
          numOfZones={manualZones.length}
          selectedZones={manualZones}
          onUpdateZones={handleZoneChange}
          uniqueIdentifier={id}
        />
      </InputGroup>
    );
  };

export default CreateClusterControlPlaneNodeAZs;
