import AppContainer from 'UI/app_container';
import PropTypes from 'prop-types';
import React from 'react';
import VirtualizedScrollableGrid from '../../shared/VirtualizedScrollableGrid';

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
        <div className='emptystate'>
          No apps matched your search query: &quot;{searchQuery}&quot;
        </div>
      );
    }

    return (
      <div ref={this.appsListRef} className='apps'>
        <VirtualizedScrollableGrid
          columnCount={{
            small: 1,
            med: 3,
            large: 4,
          }}
          rowHeight={180}
          className='apps__scroll-container'
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
        </VirtualizedScrollableGrid>
      </div>
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
