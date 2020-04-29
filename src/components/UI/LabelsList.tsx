import { V5ClusterLabels } from 'giantswarm';
import PropTypes from 'prop-types';
import React from 'react';
import ValueLabel from 'UI/ValueLabel';

interface ILabelsListProps {
  labels: V5ClusterLabels;
}

const LabelsList: React.FC<ILabelsListProps> = ({ labels }) => {
  if (!labels) {
    return null;
  }

  return (
    /* Disable eslint, otherwise typescript thinks return type is Element[] */
    /* eslint-disable-next-line react/jsx-no-useless-fragment */
    <>
      {Object.entries(labels).map(([label, value]) => (
        <ValueLabel value={value} label={label} key={label} />
      ))}
    </>
  );
};

LabelsList.propTypes = {
  // @ts-ignore
  labels: PropTypes.object.isRequired,
};

export default LabelsList;
