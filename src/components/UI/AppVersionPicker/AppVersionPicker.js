import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useState } from 'react';

// AppVersionPicker takes a list of app versions and a currently selected version
// and provides a dropdown like component for picking one of those versions.
// It is a 'controlled' input type of component meaning it does not track its
// own state. Instead it should be controlled by another component that receives
// AppVersionPicker's onChange and does something with it.

const INNER_PADDING = '5px 15px';
const MAX_WIDTH = '250px';
const MAX_HEIGHT = '250px';

const Wrapper = styled.div`
  max-width: ${MAX_WIDTH};
  border-radius: ${props => props.theme.border_radius};
  background-color: ${props => props.theme.colors.shade4};
  overflow: hidden;
  font-size: 14px;
  box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  background-color: ${props => props.theme.colors.shade1};
  padding: ${INNER_PADDING};

  h5 {
    font-weight: bold;
    font-size: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid ${props => props.theme.colors.shade2};
  }

  label {
    font-weight: normal;
    &::selection {
      color: none;
      background: none;
    }

    input {
      margin-right: 5px;
      position: relative;
      top: -1px;
    }
  }
`;

const Body = styled.div`
  max-height: ${MAX_HEIGHT};
  overflow-y: scroll;

  ul {
    padding: 0px;
  }

  li {
    padding: 10px 15px;
    list-style-type: none;
    border-bottom: 1px solid ${props => props.theme.colors.shade1};
    cursor: pointer;

    &:hover {
      background-color: ${props => props.theme.colors.shade3};
    }

    &.selected {
      font-weight: bold;
    }
  }
`;

const AppVersionPicker = ({
  onChange,
  selectedVersion,
  versions,
  ...props
}) => {
  const [includeTestVersions, setIncludeTestVersions] = useState(false);

  const handleSetIncludeTestVersions = event => {
    setIncludeTestVersions(event.target.checked);
  };

  const handleOnChange = event => {
    if (onChange) {
      onChange(event.currentTarget.dataset.version);
    }
  };

  return (
    <Wrapper {...props}>
      <Header>
        <h5>Switch Chart Version</h5>

        <label>
          <input
            name='includeTestVersions'
            type='checkbox'
            checked={includeTestVersions}
            onChange={handleSetIncludeTestVersions}
          />
          Include test versions
        </label>
      </Header>

      <Body>
        <ul>
          {versions
            ?.filter(version => (includeTestVersions ? true : !version.test))
            .map(version => {
              return (
                <li
                  className={
                    version.version === selectedVersion ? 'selected' : ''
                  }
                  key={version.version}
                  onClick={handleOnChange}
                  data-version={version.version}
                >
                  {version.version}
                </li>
              );
            })}
        </ul>
      </Body>
    </Wrapper>
  );
};

AppVersionPicker.propTypes = {
  onChange: PropTypes.func,
  selectedVersion: PropTypes.string,
  versions: PropTypes.array,
};

export default AppVersionPicker;
