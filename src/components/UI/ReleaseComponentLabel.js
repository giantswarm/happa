import { css } from '@emotion/core';
import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';

const radius = '5px';

const Wrapper = styled.div`
  display: inline-block;
  margin-bottom: 15px;
  margin-right: 5px;
  white-space: nowrap;
`;

const CommonCSS = css`
  padding: 5px 8px;
  border: 1px solid #395b70;
  font-size: 14px;
  font-weight: 300;
`;

const NameWrapper = styled.span`
  ${CommonCSS};
  background-color: #395b70;
  border-top-left-radius: ${radius};
  border-bottom-left-radius: ${radius};
  border-right: none;
`;

const VersionWrapper = styled.span`
  ${CommonCSS};
  border-top-right-radius: ${radius};
  border-bottom-right-radius: ${radius};
  border-left: none;
  color: #eee;
`;

const OldVersion = styled.span`
  color: #f56262;
`;

const NewVersion = styled.span`
  color: #24a524;
`;

const ChangeArrow = styled.span`
  margin: 0 3px;
`;

const VersionLabel = props => {
  const { newVersion, oldVersion, isAdded, isRemoved } = props;

  if (oldVersion) {
    return (
      <VersionWrapper>
        <OldVersion aria-label={`version ${oldVersion}`}>
          {oldVersion}
        </OldVersion>
        <ChangeArrow aria-label='is upgraded to'>➞</ChangeArrow>
        <NewVersion aria-label={`version ${newVersion}`}>
          {newVersion}
        </NewVersion>
      </VersionWrapper>
    );
  } else if (isRemoved) {
    return <VersionWrapper>removed</VersionWrapper>;
  } else if (isAdded) {
    return (
      <VersionWrapper aria-label={`version ${newVersion}`}>
        {newVersion} (added)
      </VersionWrapper>
    );
  }

  return (
    <VersionWrapper aria-label={`version ${newVersion}`}>
      {newVersion}
    </VersionWrapper>
  );
};

VersionLabel.propTypes = {
  newVersion: PropTypes.string,
  oldVersion: PropTypes.string,
  isAdded: PropTypes.bool,
  isRemoved: PropTypes.bool,
};

// eslint-disable-next-line react/no-multi-comp
const ReleaseComponentLabel = props => {
  const { name, version, oldVersion, isAdded, isRemoved } = props;

  return (
    <Wrapper>
      <NameWrapper>{name}</NameWrapper>
      <VersionLabel
        isAdded={isAdded}
        isRemoved={isRemoved}
        newVersion={version}
        oldVersion={oldVersion}
      />
    </Wrapper>
  );
};

ReleaseComponentLabel.propTypes = {
  name: PropTypes.string.isRequired,
  oldVersion: PropTypes.string,
  version: PropTypes.string,
  isAdded: PropTypes.bool,
  isRemoved: PropTypes.bool,
};

export default ReleaseComponentLabel;
