import PropTypes from 'prop-types';
import React from 'react';
import ValueLabel from 'UI/ValueLabel';

interface ILabelsList {
  labels: { [key: string]: { value: string } };
}

const LabelsList = ({ labels }: ILabelsList) => {
  if (!labels) {
    return null;
  }

  return Object.entries(labels).map(([label, value]) => (
    <ValueLabel value={value} label={label} key={label} />
  ));
};

LabelsList.propTypes = {
  labels: PropTypes.object,
};

export default LabelsList;
