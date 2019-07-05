import { css } from '@emotion/core';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';

const Wrapper = styled.div`
  display: inline-block;
  margin-bottom: 15px;
  margin-right: 5px;
`;

const NameWrapper = styled.span`
  background-color: rgba(255, 255, 255, 0.1);
  padding: 5px 8px;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  border: 1px rgba(255, 255, 255, 0.1);
  font-size: 14px;
  font-weight: 300;
`;

const VersionCSS = css`
  padding: 5px 8px;
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 14px;
  font-weight: 300;
`;

const OldVersion = styled.span`
  ${VersionCSS};
  color: red;
`;
const NewVersion = styled.span`
  ${VersionCSS};
  color: green;
`;
const Version = styled.span`
  ${VersionCSS};
  color: #eee;
`;

const ChangeArrow = styled.span``;

const VersionLabel = props => {
  const { newVersion, oldVersion } = props;

  if (oldVersion) {
    return (
      <span>
        <OldVersion>{oldVersion}</OldVersion>
        <ChangeArrow>➞</ChangeArrow>
        <NewVersion>{newVersion}</NewVersion>
      </span>
    );
  }
  return (
    <span>
      <Version>{newVersion}</Version>
    </span>
  );
};

VersionLabel.propTypes = {
  newVersion: PropTypes.string.isRequired,
  oldVersion: PropTypes.string,
};

const ReleaseComponentLabel = props => {
  const { name, version, oldVersion } = props;

  return (
    <Wrapper>
      <NameWrapper>{name}</NameWrapper>
      <VersionLabel newVersion={version} oldVersion={oldVersion} />
    </Wrapper>
  );
};

ReleaseComponentLabel.propTypes = {
  name: PropTypes.string.isRequired,
  oldVersion: PropTypes.string,
  version: PropTypes.string.isRequired,
};

export default ReleaseComponentLabel;
