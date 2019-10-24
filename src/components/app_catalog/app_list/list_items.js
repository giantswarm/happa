import AppContainer from 'UI/app_container';
import PropTypes from 'prop-types';
import React from 'react';
import VirtualizedScrollableGrid from '../../shared/VirtualizedScrollableGrid';

class AppListItems extends React.Component {
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
      <div className='apps'>
        <VirtualizedScrollableGrid
          columnCount={4}
          rowHeight={180}
          width={1054}
          data={apps}
          className='apps__scroll-container'
        >
          {(style, content) => (
            <AppContainer
              ref={ref => this.props.registerRef(content[0].name, ref)}
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
  registerRef: PropTypes.func,
};

export default AppListItems;
