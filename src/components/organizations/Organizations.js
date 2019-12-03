import { Breadcrumb } from 'react-breadcrumbs';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';
import Detail from './detail';
import List from './list/List';
import PropTypes from 'prop-types';
import React from 'react';

const Organizations = props => {
  const { url, path } = props.match;

  return (
    <Breadcrumb data={{ title: 'ORGANIZATIONS', pathname: url }}>
      <Switch>
        <Route component={List} exact path={`${path}`} />
        <Route component={Detail} path={`${path}/:orgId`} />
        <Redirect path={`${path}*`} to={`${url}`} />
      </Switch>
    </Breadcrumb>
  );
};

Organizations.propTypes = {
  dispatch: PropTypes.func,
  match: PropTypes.object,
};

export default connect()(Organizations);
