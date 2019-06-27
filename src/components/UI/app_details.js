import { Link } from 'react-router-dom';
import AppDetaislDL from './app_details_dl';
import PropTypes from 'prop-types';
import React from 'react';

const AppDetails = props => {
  const { appVersions, params, q, imgErrorFlag, imgError, repo, children } = props;
  const { name, icon, keywords, version, appVersion, description, home, sources, urls } = appVersions[0];
  const to = `/apps/${params.repo}/?q=${q}#${name}`;

  return (
    <div className='app-detail'>
      <Link to={to} >
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to &quot;{repo.spec.title}&quot;
      </Link>
      <br />
      <br />
      <div className='app-detail--header clearfix'>
        {icon &&
          icon !== '' &&
          !imgErrorFlag && (
            <div className='app-detail--icon'>
              <img
                onError={imgError}
                src={icon}
              />
            </div>
          )}

        <div className='app-detail--title'>
          <h1>{name}</h1>
          <div className='keywords'>
            {keywords && keywords.map(x => (
              <span className='keyword' key={x}>
                {x}
              </span>
            ))}
          </div>

          <div className='version'>
            <small>Chart&nbsp;Version</small>&nbsp;
                    <code>{version}</code>{' '}
            <small>App&nbsp;Version</small>&nbsp;
                    <code>{appVersion}</code>
          </div>
        </div>

        <div className='app-detail--install'>
          {children}
        </div>
      </div>

      <div className='app-detail--body'>
        {description && description && (
          <React.Fragment>
            <small>Description</small>
            <p>{description}</p>
          </React.Fragment>
        )}

        {/* home is a string so we convert it to an array because AppDetails expects an array */}
        {home && home !== '' &&
          <AppDetaislDL data={typeof home === 'string' ? [home] : home} label="Home" />
        }
        {sources &&
          <AppDetaislDL data={sources} label="Sources" />
        }
        {urls &&
          <AppDetaislDL data={urls} label="URLS" />
        }
      </div>
    </div>
  );
};

AppDetails.propTypes = {
  appVersions: PropTypes.array,
  params: PropTypes.object,
  q: PropTypes.string,
  imgErrorFlag: PropTypes.bool,
  imgError: PropTypes.func,
  repo: PropTypes.object,
  children: PropTypes.any,
};

export default AppDetails;