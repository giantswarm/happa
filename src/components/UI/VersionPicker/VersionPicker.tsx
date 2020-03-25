import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import DropdownMenu from 'UI/DropdownMenu';

const INNER_PADDING = '5px 15px';
const WIDTH = '250px';
const MAX_HEIGHT = '250px';

const Wrapper = styled.div`
  div > button {
    background-color: ${(props) => props.theme.colors.shade5};
    border: 1px solid ${(props) => props.theme.colors.shade6};
    border-radius: ${(props) => props.theme.border_radius};
    font-size: 14px;
    line-height: normal;
    padding: 8px 10px;
    width: auto;
    height: 34px;

    .caret {
      margin-left: 10px;
    }
  }
`;

const Menu = styled.form`
  width: ${WIDTH};
  border-radius: ${(props) => props.theme.border_radius};
  background-color: ${(props) => props.theme.colors.shade4};
  overflow: hidden;
  font-size: 14px;
  box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 45px;
`;

const Header = styled.div`
  background-color: ${(props) => props.theme.colors.shade1};
  padding: ${INNER_PADDING};

  h5 {
    font-weight: bold;
    font-size: 14px;
  }

  label {
    border-top: 1px solid ${(props) => props.theme.colors.shade2};

    padding: 0px;
    cursor: pointer;
    font-weight: normal;

    &::selection {
      color: none;
      background: none;
    }

    input {
      margin-right: 5px;
      position: relative;
      top: -1px;
      z-index: 2;
    }

    a {
      display: inline;
      padding: 0px;

      &:hover {
        background-color: inherit;
      }
    }
  }
`;

const Body = styled.div`
  max-height: ${MAX_HEIGHT};
  overflow-y: scroll;

  ul {
    padding: 0px;
    width: 100%;
    position: relative;
    right: 0px;
  }

  li {
    list-style-type: none;
    border-bottom: 1px solid ${(props) => props.theme.colors.shade1};
    cursor: pointer;

    a.selected {
      font-weight: bold;
    }

    a {
      padding: 10px 15px;
    }
  }
`;

interface IVersion {
  // The version
  version: string;

  // Whether or not this version is a test version.
  test: boolean;
}

interface IVersionPickerProps {
  // An array of versions to pick from.
  versions: IVersion[];

  // The currently selected version, will be highlighted in bold in the list.
  selectedVersion: string;

  // A callback function that gets called when a version is selected by the user.
  onChange?: (newVersion?: string) => void;
}

/**
 * VersionPicker is a dropdown style UI component for selecting a single version from a list
 * of versions. The list of versions can contain test versions, and this component
 * allows the users to choose whether they want to see the test versions or not.
 */
const VersionPicker: React.FC<IVersionPickerProps> = ({
  onChange,
  selectedVersion,
  versions,
  ...props
}) => {
  const [includeTestVersions, setIncludeTestVersions] = useState<boolean>(
    false
  );

  const handleSetIncludeTestVersions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIncludeTestVersions(event.target.checked);
  };

  const handleOnChange = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (onChange) {
      onChange(event.currentTarget.dataset.version);
    }
  };

  const toggleIncludeTestVersions = () => {
    setIncludeTestVersions(!includeTestVersions);
  };

  return (
    <Wrapper>
      <DropdownMenu
        render={({
          isOpen,
          onClickHandler,
          onKeyDownHandler,
          onBlurHandler,
          onFocusHandler,
        }) => (
          <div onBlur={onBlurHandler} onFocus={onFocusHandler}>
            <button
              aria-expanded={isOpen}
              aria-haspopup='true'
              onClick={onClickHandler}
              onKeyDown={onKeyDownHandler}
              type='button'
            >
              {selectedVersion}
              <span className='caret' />
            </button>
            {isOpen && (
              <Menu {...props}>
                <Header>
                  <h5>Switch Chart Version</h5>

                  {versions?.some((v) => v.test) && (
                    <label>
                      <input
                        name='includeTestVersions'
                        type='checkbox'
                        checked={includeTestVersions}
                        onChange={handleSetIncludeTestVersions}
                      />
                      <a
                        href='#'
                        onClick={(e) => {
                          e.preventDefault();
                          toggleIncludeTestVersions();
                        }}
                      >
                        Include test versions
                      </a>
                    </label>
                  )}
                </Header>

                <Body role='menu' data-testid='menu'>
                  <ul>
                    {versions
                      ?.filter((version) => {
                        return includeTestVersions ? true : !version.test;
                      })
                      .map((version) => {
                        return (
                          <li key={version.version}>
                            <a
                              className={
                                version.version === selectedVersion
                                  ? 'selected'
                                  : ''
                              }
                              href='#'
                              onClick={(e) => {
                                handleOnChange(e);
                              }}
                              data-version={version.version}
                              role='menuitem'
                            >
                              {version.version}
                            </a>
                          </li>
                        );
                      })}
                  </ul>
                </Body>
              </Menu>
            )}
          </div>
        )}
      />
    </Wrapper>
  );
};

VersionPicker.propTypes = {
  selectedVersion: PropTypes.string.isRequired,
  versions: PropTypes.array.isRequired,
  onChange: PropTypes.func,
};

export default VersionPicker;
