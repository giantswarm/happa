import PropTypes from 'prop-types';
import React from 'react';
import ValueLabel from 'UI/ValueLabel';

interface ILabel {
  [key: string]: string;
}

interface ILabelsList {
  labels: ILabel;
}

const LabelsList = ({ labels }: ILabelsList) => {
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
  labels: PropTypes.object.isRequired,
};

export default LabelsList;
