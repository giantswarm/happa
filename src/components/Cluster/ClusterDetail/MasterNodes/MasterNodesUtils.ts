export function getAvailabilityZonesSectionLabel(azs: string[]): string {
  let label = 'Availability zone';

  if (azs.length > 1) {
    label += 's';
  }

  return label;
}
