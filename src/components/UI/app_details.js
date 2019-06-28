import { Link } from 'react-router-dom';
import AppDetailsBody from './app_details_body';
import AppDetailsItem from './app_details_item';
import PropTypes from 'prop-types';
import React from 'react';

const AppDetails = props => {
  const {
    appVersions,
    params,
    q,
    imgErrorFlag,
    imgError,
    repo,
    children,
  } = props;
  const {
    name,
    icon,
    keywords,
    version,
    appVersion,
    description,
    home,
    sources,
    urls,
  } = appVersions[0];
  const to = `/apps/${params.repo}/?q=${q}#${name}`;

  return (
    <div className='app-detail'>
      <Link to={to}>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to &quot;{repo.spec.title}&quot;
      </Link>
      <br />
      <br />
      <div className='app-detail--header clearfix'>
        {icon && icon !== '' && !imgErrorFlag && (
          <div className='app-detail--icon'>
            <img onError={imgError} src={icon} />
          </div>
        )}

        <div className='app-detail--title'>
          <h1>{name}</h1>
          <div className='keywords'>
            {keywords &&
              keywords.map(x => (
                <span className='keyword' key={x}>
                  {x}
                </span>
              ))}
          </div>

          <div className='version'>
            <small>Chart&nbsp;Version</small>&nbsp;
            <code>{version}</code> <small>App&nbsp;Version</small>&nbsp;
            <code>{appVersion}</code>
          </div>
        </div>

        <div className='app-detail--install'>{children}</div>
      </div>

      <AppDetailsBody description={description}>
        {home && home !== '' && <AppDetailsItem data={home} label='Home' />}
        {sources && <AppDetailsItem data={sources} label='Sources' />}
        {urls && <AppDetailsItem data={urls} label='URLS' />}
      </AppDetailsBody>
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
