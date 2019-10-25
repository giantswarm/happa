import { APP_CONTAINER_HEIGHT } from '../../UI/AppContainer';
import AppContainer from 'UI/AppContainer';
import PropTypes from 'prop-types';
import React from 'react';
import styled from '@emotion/styled';
import VirtualizedScrollableGrid from '../../shared/VirtualizedScrollableGrid';

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

const StyledVirtualizedGrid = styled(VirtualizedScrollableGrid)`
  height: 100% !important;
  width: 100% !important;
`;

class AppListItems extends React.Component {
  appsListRef = React.createRef();

  componentDidMount() {
    /**
     * Forcing an initial update to have the ref updated with
     * the right element, while rendering the list
     */
    this.forceUpdate();
  }

  render() {
    const { apps, searchQuery } = this.props;

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
          rowHeight={parseInt(APP_CONTAINER_HEIGHT, 10)}
          data={apps}
          adaptWidthToElement={this.appsListRef.current}
        >
          {(style, content) => (
            <AppContainer
              style={style}
              appVersions={content}
              catalog={this.props.catalog}
              iconErrors={this.props.iconErrors}
              imgError={this.props.onImgError}
              searchQuery={searchQuery}
            />
          )}
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
};

export default AppListItems;
