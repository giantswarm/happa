import PropTypes from 'prop-types';
import React, { useMemo, useState } from 'react';
import { relativeDate } from 'lib/helpers';
import styled from 'styled-components';
import DropdownMenu, {
  DropdownTrigger,
  Link,
  List,
} from 'UI/Controls/DropdownMenu';
import Truncated from 'UI/Util/Truncated';

import {
  checkIfContainsTestVersions,
  filterVersions,
  IVersion,
} from './VersionPickerUtils';

const INNER_PADDING = '5px 15px';
const WIDTH = '250px';
const MAX_HEIGHT = '250px';

const VersionPickerDropdownTrigger = styled(DropdownTrigger)`
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
`;

const Wrapper = styled.div``;

const Menu = styled.form`
  width: ${WIDTH};
  border-radius: ${(props) => props.theme.border_radius};
  background-color: ${(props) => props.theme.colors.shade4};
  overflow: hidden;
  font-size: 14px;
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.2);
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

    padding: 0;
    cursor: pointer;
    font-weight: normal;

    &::selection {
      color: unset;
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
      padding: 0;

      &:hover {
        background-color: inherit;
      }
    }
  }
`;

const Body = styled.div`
  max-height: ${MAX_HEIGHT};
  overflow-y: scroll;
`;

const VersionPickerList = styled(List)`
  padding: 0;
  width: 100%;
  position: relative;
  right: 0;
`;

const VersionPickerItem = styled.li`
  list-style-type: none;
  border-bottom: 1px solid ${(props) => props.theme.colors.shade1};
  cursor: pointer;

  span {
    margin-right: 15px;
  }
`;

const VersionPickerLink = styled(Link)<{ selected: boolean }>`
  padding: 10px 15px;

  font-weight: ${({ selected }) => selected && 'bold'};
`;

interface IVersionPickerProps {
  // An array of versions to pick from.
  versions?: IVersion[];

  // The currently selected version, will be highlighted in bold in the list.
  selectedVersion?: string;

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

  const containsTestVersions = useMemo(
    () => checkIfContainsTestVersions(versions),
    [versions]
  );

  const filteredVersions = useMemo(
    () => filterVersions(includeTestVersions, versions),
    [includeTestVersions, versions]
  );

  const handleSetIncludeTestVersions = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setIncludeTestVersions(event.target.checked);
  };

  const handleOnChange = (version: string) => (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();
    console.log(version);
    onChange?.(version);
  };

  const toggleIncludeTestVersions = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    event.preventDefault();

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
            <VersionPickerDropdownTrigger
              aria-expanded={isOpen}
              aria-haspopup='true'
              onClick={onClickHandler}
              onKeyDown={onKeyDownHandler}
              type='button'
            >
              <Truncated as='span'>{selectedVersion as string}</Truncated>
              <span className='caret' />
            </VersionPickerDropdownTrigger>
            {isOpen && (
              <Menu {...props}>
                <Header>
                  <h5>Switch Chart Version</h5>

                  {containsTestVersions && (
                    <label>
                      <input
                        name='includeTestVersions'
                        type='checkbox'
                        checked={includeTestVersions}
                        onChange={handleSetIncludeTestVersions}
                      />
                      <a href='#' onClick={toggleIncludeTestVersions}>
                        Include test versions
                      </a>
                    </label>
                  )}
                </Header>

                <Body role='menu' data-testid='menu'>
                  <VersionPickerList>
                    {filteredVersions.map((version) => {
                      return (
                        <VersionPickerItem key={version.chartVersion}>
                          <VersionPickerLink
                            selected={version.chartVersion === selectedVersion}
                            href='#'
                            onClick={(e) => {
                              handleOnChange(version.chartVersion)(e);
                              onBlurHandler();
                            }}
                            role='menuitem'
                          >
                            <Truncated as='span'>
                              {version.chartVersion}
                            </Truncated>
                            {relativeDate(version.created)}
                          </VersionPickerLink>
                        </VersionPickerItem>
                      );
                    })}
                  </VersionPickerList>
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
  selectedVersion: PropTypes.string,
  versions: PropTypes.array,
  onChange: PropTypes.func,
};

export default VersionPicker;
