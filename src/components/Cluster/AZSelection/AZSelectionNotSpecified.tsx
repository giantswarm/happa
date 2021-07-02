import { Text } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

import { AZSelectionVariants } from './AZSelectionUtils';

interface IAZSelectionNotSpecifiedProps {
  variant: AZSelectionVariants;
}

const AZSelectionNotSpecified: React.FC<IAZSelectionNotSpecifiedProps> = ({
  variant,
}) => {
  let descriptionMessage =
    'By not specifying an availability zone, Azure will select a zone by itself, where the requested virtual machine size has the best availability.';
  if (variant === AZSelectionVariants.NodePool) {
    descriptionMessage =
      'By not specifying an availability zone, Azure will select a zone by itself, where the requested virtual machine size has the best availability. This is especially useful for virtual machine sizes with GPU, which are not available in all availability zones.';
  }

  return <Text>{descriptionMessage}</Text>;
};

AZSelectionNotSpecified.propTypes = {
  variant: PropTypes.number.isRequired,
};

export default AZSelectionNotSpecified;
