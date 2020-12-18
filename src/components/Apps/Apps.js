import React from 'react';
import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { AppsRoutes } from 'shared/constants/routes';

class Apps extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  render() {
    return (
      <Breadcrumb
        data={{
          title: 'Apps'.toUpperCase(),
          pathname: AppsRoutes.Home,
        }}
      >
        <Switch>
          <Route
            exact
            path={AppsRoutes.AppDetail}
            render={() => <h1>App Detail</h1>}
          />
          <Route path={AppsRoutes.Home} render={() => <h1>Apps</h1>} />
        </Switch>
      </Breadcrumb>
    );
  }
}

Apps.propTypes = {};

function mapStateToProps() {
  return {};
}

function mapDispatchToProps() {
  return {};
}

export default connect(mapStateToProps, mapDispatchToProps)(Apps);
