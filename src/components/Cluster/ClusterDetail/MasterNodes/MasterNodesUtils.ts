export function getAvailabilityZonesSectionLabel(azs: string[]): string {
  let label = 'Availability zone';

  if (azs.length > 1) {
    label += 's';
  }

  return label;
}

export function getReadinessLabel(
  currentNodeCount: number | null,
  maxNodeCount: number
): string {
  if (currentNodeCount === null) {
    return 'No status info';
  }

  if (currentNodeCount < maxNodeCount) {
    if (maxNodeCount === 1) {
      return 'Not ready';
    }

    return `${currentNodeCount} of ${maxNodeCount} control plane nodes ready`;
  }

  if (maxNodeCount === 1) {
    return 'Ready';
  }

  return `All ${maxNodeCount} control plane nodes ready`;
}
