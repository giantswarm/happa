import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import theme from 'styles/theme';

import ValueLabel from './ValueLabel';

const OldVersion = styled.span`
  color: ${(p) => p.theme.colors.redOld};
`;

const NewVersion = styled.span`
  color: ${(p) => p.theme.colors.greenNew};
`;

const ChangeArrow = styled.span`
  margin: 0 3px;
`;

const VersionLabel = (props) => {
  const { newVersion, oldVersion, isAdded, isRemoved } = props;

  if (oldVersion) {
    return (
      <>
        <OldVersion aria-label={`version ${oldVersion}`}>
          {oldVersion}
        </OldVersion>
        <ChangeArrow aria-label='is upgraded to'>➞</ChangeArrow>
        <NewVersion aria-label={`version ${newVersion}`}>
          {newVersion}
        </NewVersion>
      </>
    );
  } else if (isRemoved) {
    return 'removed';
  } else if (isAdded) {
    return (
      <span aria-label={`version ${newVersion}`}>{newVersion} (added)</span>
    );
  }

  return <span aria-label={`version ${newVersion}`}>{newVersion}</span>;
};

VersionLabel.propTypes = {
  newVersion: PropTypes.string,
  oldVersion: PropTypes.string,
  isAdded: PropTypes.bool,
  isRemoved: PropTypes.bool,
};

// eslint-disable-next-line react/no-multi-comp
const ReleaseComponentLabel = (props) => {
  const { name, version, oldVersion, isAdded, isRemoved, className } = props;

  return (
    <ValueLabel
      className={className}
      color={theme.colors.darkBlueLighter1}
      label={name}
      value={
        <VersionLabel
          isAdded={isAdded}
          isRemoved={isRemoved}
          newVersion={version}
          oldVersion={oldVersion}
        />
      }
    />
  );
};

ReleaseComponentLabel.propTypes = {
  name: PropTypes.string.isRequired,
  oldVersion: PropTypes.string,
  version: PropTypes.string,
  isAdded: PropTypes.bool,
  isRemoved: PropTypes.bool,
  className: PropTypes.string,
};

export default ReleaseComponentLabel;
