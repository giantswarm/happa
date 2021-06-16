import styled from 'styled-components';

export enum AvailabilityZoneSelection {
  Automatic,
  Manual,
  NotSpecified,
}

export const enum AZSelectionVariants {
  Master,
  NodePool,
}

export interface IUpdateZonePickerPayload {
  value: number;
  valid: boolean;
}

export interface IUpdateZoneLabelsPayload {
  number: number;
  zonesString: string;
  zonesArray: string[];
  valid: boolean;
}

export type AZSelectionZonesUpdater = (
  azSelection: AvailabilityZoneSelection
) => (payload: IUpdateZonePickerPayload | IUpdateZoneLabelsPayload) => void;

export const AZSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacingPx * 5}px;
  margin-bottom: ${({ theme }) => theme.spacingPx * 2}px;
`;
