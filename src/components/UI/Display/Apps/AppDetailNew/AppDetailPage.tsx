import { relativeDate } from 'lib/helpers';
import PropTypes from 'prop-types';
import React, { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import gfm from 'remark-gfm';
import styled from 'styled-components';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import AppIcon from 'UI/Display/Apps/AppList/AppIcon';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import Truncated from 'UI/Util/Truncated';

import AppDetailsLoadingPlaceholder from './AppDetailsLoadingPlaceholder';
import { HeadingRenderer, IATagProps, readmeBaseURL, urlFor } from './utils';

const Header = styled.div`
  display: flex;
  margin-top: 25px;
  align-items: center;
  margin-bottom: 25px;
`;

const HeaderDetails = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
`;

const Upper = styled.div`
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid ${({ theme }) => theme.colors.darkBlueLighter3};
  margin-bottom: 20px;

  div:last-child {
    margin-right: 0px;
  }
`;

const Lower = styled.div`
  color: ${({ theme }) => theme.colors.darkBlueLighter6};
`;

const AppIconWrapper = styled.div`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
  margin-right: 20px;
  border-radius: ${(props) => props.theme.border_radius};
  width: 130px;
  height: 130px;

  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const StyledAppIcon = styled(AppIcon)`
  border-radius: 5px;
  text-align: center;
  font-size: 60px;
  width: 100%;
  margin: auto;
`;

const Body = styled.div`
  display: flex;
`;

const Readme = styled.div`
  background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  width: 65%;
  border-radius: 5px;
  margin-right: 25px;
  flex-shrink: 0;
  padding: 20px;
  overflow-x: scroll;

  .markdown pre {
    background-color: ${(props) => props.theme.colors.darkBlueDarker6};
    border: none;
    font-size: 16px;
    color: ${(props) => props.theme.colors.white2};
  }

  .markdown h1 {
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 24px;
    font-weight: 500;
  }

  .markdown h2 {
    margin-top: 20px;
    font-size: 20px;
  }
`;

const Details = styled.div`
  display: flex;
  flex-direction: column;
  width: 35%;
`;

const DetailGroup = styled.div``;

const Detail = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.darkBlueLighter3};
  padding-top: 10px;
  margin-bottom: 25px;

  small {
    font-size: 12px;
    margin-bottom: 6px;
  }
`;

const Keyword = styled.span`
  margin-right: 10px;
  font-family: Inconsolata, monospace;
  background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
  padding: 5px 8px;
  border-radius: 5px;
`;

const VersionPickerRow = styled.div`
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  & > span {
    margin-right: 10px;
  }
`;

const Wrapper = styled.div`
  &.no-readme {
    max-width: 1000px;
    margin: auto;

    .shrinkable {
      width: 33%;
    }

    ${Body} {
      margin-left: 150px;
    }

    ${VersionPickerRow} {
      margin-left: 150px;
      margin-bottom: 30px;
    }

    ${Details} {
      width: 100%;
    }

    ${DetailGroup} {
      display: flex;
      ${Detail} {
        width: 33%;
        margin-right: 25px;

        &:last-child {
          margin-right: 0px;
        }
      }
    }
  }
`;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  margin: auto;
  width: 50px;
  display: block;
  margin-top: 50px;
`;

export interface IAppDetailPageProps {
  selectVersion: (version: string) => void;
  appTitle?: string;
  catalogName?: string;
  catalogDescription?: string;
  otherVersions?: IVersion[];
  chartVersion?: string;
  createDate?: string;
  includesVersion?: string;
  description?: string;
  website?: string;
  installAppModal?: ReactElement;
  catalogIcon?: string;
  appIconURL?: string;
  keywords?: string[];
  readme?: string;
  readmeError?: string;
  readmeURL?: string;
}

const AppDetail: React.FC<IAppDetailPageProps> = (props) => {
  return (
    <Wrapper className={props.readmeURL ? '' : 'no-readme'}>
      <Link to='/apps'>
        <i aria-hidden='true' className='fa fa-chevron-left' />
        Back to Apps
      </Link>

      <Header>
        <AppIconWrapper>
          <StyledAppIcon src={props.appIconURL} name={props.appTitle ?? ''} />
        </AppIconWrapper>
        <HeaderDetails>
          <Upper>
            <h1>{props.appTitle ?? <AppDetailsLoadingPlaceholder />}</h1>
            {props.installAppModal}
          </Upper>
          <Lower>
            {props.catalogName ? (
              <CatalogLabel
                catalogName={props.catalogName}
                description={props.catalogDescription}
                iconUrl={props.catalogIcon}
              />
            ) : (
              <AppDetailsLoadingPlaceholder />
            )}
          </Lower>
        </HeaderDetails>
      </Header>
      <VersionPickerRow>
        <span>Information for:</span>
        {props.otherVersions ? (
          <VersionPicker
            onChange={(v) => {
              if (v) {
                props.selectVersion(v);
              }
            }}
            selectedVersion={props.chartVersion}
            versions={props.otherVersions}
          />
        ) : (
          <AppDetailsLoadingPlaceholder />
        )}
      </VersionPickerRow>
      <Body>
        {props.readmeURL && (
          <Readme>
            {props.readme && (
              <ReactMarkdown
                plugins={[gfm]}
                skipHtml
                className='markdown'
                components={{
                  h1: HeadingRenderer,
                  h2: HeadingRenderer,
                  h3: HeadingRenderer,
                  h4: HeadingRenderer,
                  h5: HeadingRenderer,
                  h6: HeadingRenderer,
                  a: (p: IATagProps) => (
                    <a
                      href={urlFor(
                        p.href || '',
                        readmeBaseURL(props.readmeURL!)
                      )}
                      target={p.href?.charAt(0) === '#' ? '' : '_blank'}
                      rel='noreferrer'
                    >
                      {p.children}
                    </a>
                  ),
                }}
              >
                {props.readme}
              </ReactMarkdown>
            )}

            {!props.readme && !props.readmeError && (
              <StyledLoadingIndicator loading={true} />
            )}

            {props.readmeError}
          </Readme>
        )}
        <Details>
          <DetailGroup>
            <Detail>
              <small>CHART VERSION</small>
              {props.chartVersion ? (
                <Truncated as='span'>{props.chartVersion}</Truncated>
              ) : (
                <AppDetailsLoadingPlaceholder />
              )}
            </Detail>

            <Detail>
              <small>CREATED</small>
              {props.createDate ? (
                relativeDate(props.createDate)
              ) : (
                <AppDetailsLoadingPlaceholder />
              )}
            </Detail>

            <Detail>
              <small>INCLUDES VERSION</small>

              {props.includesVersion ? (
                <Truncated as='span'>{props.includesVersion}</Truncated>
              ) : (
                <AppDetailsLoadingPlaceholder />
              )}
            </Detail>
          </DetailGroup>

          <Detail>
            <small>DESCRIPTION</small>

            {props.description ? (
              props.description
            ) : (
              <AppDetailsLoadingPlaceholder />
            )}
          </Detail>

          <Detail>
            <small>WEBSITE</small>
            {props.website ? (
              <a href={props.website} target='_blank' rel='noopener noreferrer'>
                {props.website}
              </a>
            ) : (
              <AppDetailsLoadingPlaceholder />
            )}
          </Detail>

          {props.keywords!.length > 0 && (
            <Detail>
              <small>KEYWORDS</small>
              {props.keywords!.map((k) => (
                <Keyword key={k}>{k}</Keyword>
              ))}
            </Detail>
          )}
        </Details>
      </Body>
    </Wrapper>
  );
};

AppDetail.defaultProps = {
  keywords: [],
};

AppDetail.propTypes = {
  selectVersion: PropTypes.func.isRequired,
  appTitle: PropTypes.string,
  appIconURL: PropTypes.string,
  catalogName: PropTypes.string,
  catalogDescription: PropTypes.string,
  catalogIcon: PropTypes.string,
  chartVersion: PropTypes.string,
  createDate: PropTypes.string,
  includesVersion: PropTypes.string,
  description: PropTypes.string,
  website: PropTypes.string,
  keywords: PropTypes.arrayOf(PropTypes.string.isRequired),
  readme: PropTypes.string,
  readmeURL: PropTypes.string,
  readmeError: PropTypes.string,
  installAppModal: PropTypes.element,
  otherVersions: PropTypes.array,
};

export default AppDetail;
