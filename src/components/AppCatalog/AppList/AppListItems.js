import styled from '@emotion/styled';
import PropTypes from 'prop-types';
import React from 'react';
import AppContainer from 'UI/AppContainer';

import VirtualizedScrollableGrid from '../../shared/VirtualizedScrollableGrid';
import { APP_CONTAINER_HEIGHT } from '../../UI/AppContainer';

const StyledEmptyState = styled.div`
  text-align: center;
  padding: 20px 30px;
  margin: 100px auto 0px auto;
  border-radius: 4px;
  font-size: 18px;
`;

const StyledAppsWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-wrap: wrap;
`;

/* `Hack` to make `WindowScroller` behave like `facebook` */
const StyledVirtualizedGrid = styled(VirtualizedScrollableGrid)`
  height: 100% !important;
  width: 100% !important;
`;

class AppListItems extends React.Component {
  static findAppToScrollToIndex(apps, appName) {
    return apps.findIndex(appVersions => appVersions[0].name === appName);
  }

  appsListRef = React.createRef();

  componentDidMount() {
    /**
     * Forcing an initial update to have the ref updated with
     * the right element, to be able to set the right
     * width to the list
     */
    this.forceUpdate();
  }

  render() {
    const { apps, searchQuery } = this.props;
    const scrollToAppIndex = AppListItems.findAppToScrollToIndex(
      apps,
      this.props.scrollToApp
    );

    if (apps.length === 0) {
      return (
        <StyledEmptyState>
          No apps matched your search query: &quot;{searchQuery}&quot;
        </StyledEmptyState>
      );
    }

    return (
      <StyledAppsWrapper ref={this.appsListRef}>
        <StyledVirtualizedGrid
          columnCount={{
            small: 1,
            med: 3,
            large: 4,
          }}
          rowHeight={APP_CONTAINER_HEIGHT}
          data={apps}
          adaptWidthToElement={this.appsListRef.current}
          scrollToItemIndex={scrollToAppIndex}
        >
          {(style, content) => {
            const newContent = [].concat(content);
            const currentIconURL = newContent[0].icon;

            if (this.props.iconErrors.hasOwnProperty(currentIconURL))
              newContent[0].icon = '';

            return (
              <AppContainer
                style={style}
                appVersions={newContent}
                catalog={this.props.catalog}
                hasError={this.props.iconErrors.hasOwnProperty(content[0].icon)}
                onImgError={this.props.onImgError}
                searchQuery={searchQuery}
              />
            );
          }}
        </StyledVirtualizedGrid>
      </StyledAppsWrapper>
    );
  }
}

AppListItems.propTypes = {
  apps: PropTypes.array,
  iconErrors: PropTypes.object,
  catalog: PropTypes.object,
  searchQuery: PropTypes.string,
  onImgError: PropTypes.func,
  scrollToApp: PropTypes.string,
};

export default AppListItems;
