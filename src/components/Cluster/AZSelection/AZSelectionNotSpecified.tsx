import * as React from 'react';

interface AZSelectionNotSpecifiedProps {}

const AZSelectionNotSpecified: React.FC<AZSelectionNotSpecifiedProps> = () => {
  return (
    <p>
      By not specifying an availability zone, Azure will select a zone by
      itself, where the requested virtual machine size has the best
      availability. This is especially useful for virtual machine sizes with
      GPU, which are not available in all availability zones.
    </p>
  );
};

AZSelectionNotSpecified.propTypes = {};

export default AZSelectionNotSpecified;
