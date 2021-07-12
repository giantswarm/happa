import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
import ValueLabel from 'UI/Display/ValueLabel';
import Truncated from 'UI/Util/Truncated';

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
        <Truncated as={OldVersion} aria-label={`version ${oldVersion}`}>
          {oldVersion}
        </Truncated>
        <ChangeArrow aria-label='is upgraded to'>➞</ChangeArrow>
        <Truncated as={NewVersion} aria-label={`version ${newVersion}`}>
          {newVersion}
        </Truncated>
      </>
    );
  } else if (isRemoved) {
    return 'removed';
  } else if (isAdded) {
    return (
      <Truncated as='span' aria-label={`version ${newVersion}`}>
        {newVersion} (added)
      </Truncated>
    );
  }

  return (
    <Truncated as='span' aria-label={`version ${newVersion}`}>
      {newVersion}
    </Truncated>
  );
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
