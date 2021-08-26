import React from 'react';
import styled from 'styled-components';
import theme from 'styles/theme';
import ValueLabel from 'UI/Display/ValueLabel';
import Truncated from 'UI/Util/Truncated';

function formatValueLabel(component, oldVersion, newVersion) {
  switch (true) {
    case Boolean(oldVersion) && Boolean(newVersion):
      return `${component} version ${oldVersion} is upgraded to version ${newVersion}`;
    case Boolean(newVersion):
      return `${component} version ${newVersion}`;
    case !oldVersion && !newVersion:
      return `${component} is removed`;
    default:
      return '';
  }
}

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
        <Truncated as={OldVersion}>{oldVersion}</Truncated>
        <ChangeArrow>➞</ChangeArrow>
        <Truncated as={NewVersion}>{newVersion}</Truncated>
      </>
    );
  } else if (isRemoved) {
    return 'removed';
  } else if (isAdded) {
    return <Truncated as='span'>{newVersion} (added)</Truncated>;
  }

  return <Truncated as='span'>{newVersion}</Truncated>;
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
      aria-label={formatValueLabel(name, oldVersion, version)}
    />
  );
};

export default ReleaseComponentLabel;
