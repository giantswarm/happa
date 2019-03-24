'use strict';

import { Link } from 'react-router-dom';
import DocumentTitle from 'react-document-title';
import PropTypes from 'prop-types';
import React from 'react';

class Catalogs extends React.Component {
  render() {
    return (
      <DocumentTitle title={`App Katalog | Giant Swarm `}>
        <React.Fragment>
          <h1>App Katalog (Preview)</h1>
          <p>
            The App Katalog provides you with an easy way to browse and install
            charts from helm repositories.
            <br />
            It comes preconfigured with 3 repositories: &quot;Managed&quot;,
            &quot;Incubator&quot;, and &quot;Community&quot;.
          </p>
          <p>
            <b>Preview Limitations:</b>
            <br />
            During the preview you&apos;ll only be able to browse the App
            Katalog. Installing charts is not yet available.
          </p>

          <br />
          <small>Pick a repository:</small>
          <div className='app-catalog--repos'>
            <Link to='/app-katalog/managed' className='app-catalog--repo'>
              <div className='app-catalog--card'>
                <h3>Managed</h3>
                <img src='/images/repo_icons/managed.png' />
              </div>
              <p>
                These charts are covered by an SLA. You install the app and we
                make sure it keeps running.
              </p>
            </Link>

            <Link to='/app-katalog/incubator' className='app-catalog--repo'>
              <div className='app-catalog--card'>
                <h3>Incubator</h3>
                <img src='/images/repo_icons/incubator.png' />
              </div>
              <p>
                This is our testing ground. Apps in this repository will
                graduate to Managed when they are considered safe and stable.
                Help us by testing these charts and giving us any feedback.
              </p>
            </Link>

            <Link to='/app-katalog/community' className='app-catalog--repo'>
              <div className='app-catalog--card'>
                <h3>Community</h3>
                <img src='/images/repo_icons/community.png' />
              </div>
              <p>
                The helm/stable repository contains a large number of charts.
                Giant Swarm offers no SLA on these apps/charts. Proceed with
                caution.
              </p>
            </Link>
          </div>
          <br />
          <br />
          <a href='#'>
            <small>Browse charts from all repositories at once</small>
          </a>
        </React.Fragment>
      </DocumentTitle>
    );
  }
}

Catalogs.propTypes = {
  appVersions: PropTypes.array,
  match: PropTypes.object,
};

export default Catalogs;
