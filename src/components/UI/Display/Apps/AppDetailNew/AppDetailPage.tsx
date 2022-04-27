import React, { ReactElement } from 'react';
import ReactMarkdown from 'react-markdown';
import { Link } from 'react-router-dom';
import gfm from 'remark-gfm';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';
import VersionPicker from 'UI/Controls/VersionPicker/VersionPicker';
import { IVersion } from 'UI/Controls/VersionPicker/VersionPickerUtils';
import AppIcon from 'UI/Display/Apps/AppList/AppIcon';
import CatalogLabel from 'UI/Display/Apps/AppList/CatalogLabel';
import Date from 'UI/Display/Date';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';
import LoadingPlaceholder from 'UI/Display/LoadingPlaceholder/LoadingPlaceholder';
import OptionalValue from 'UI/Display/OptionalValue/OptionalValue';
import Truncated from 'UI/Util/Truncated';

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

const NonBreakingLink = styled.a`
  white-space: nowrap;
`;

const Upper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
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
  selectedClusterBanner?: ReactElement;
}

const AppDetail: React.FC<IAppDetailPageProps> = (props) => {
  return (
    <Wrapper className={props.readmeURL ? '' : 'no-readme'}>
      <Link to='/apps'>
        <Button
          icon={<i aria-hidden='true' className='fa fa-chevron-left' />}
          plain={true}
        >
          Back to Apps
        </Button>
      </Link>
      {props.selectedClusterBanner}
      <Header>
        <AppIconWrapper>
          <StyledAppIcon src={props.appIconURL} name={props.appTitle ?? ''} />
        </AppIconWrapper>
        <HeaderDetails>
          <Upper>
            <h1>
              <OptionalValue
                value={props.appTitle}
                loaderWidth={200}
                loaderHeight={28}
              >
                {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
                {(value) => <>{value}</>}
              </OptionalValue>
            </h1>
            {props.installAppModal}
          </Upper>
          <Lower>
            <OptionalValue
              value={props.catalogName}
              loaderWidth={200}
              loaderHeight={28}
            >
              {(value) => (
                <CatalogLabel
                  catalogName={value}
                  description={props.catalogDescription}
                  iconUrl={props.catalogIcon}
                />
              )}
            </OptionalValue>
          </Lower>
        </HeaderDetails>
      </Header>
      <VersionPickerRow>
        <span>Information for:</span>
        {typeof props.otherVersions !== 'undefined' ? (
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
          <LoadingPlaceholder width={200} height={28} />
        )}
      </VersionPickerRow>
      <Body>
        {typeof props.readmeURL !== 'undefined' && (
          <Readme>
            {typeof props.readme !== 'undefined' && (
              <ReactMarkdown
                remarkPlugins={[gfm]}
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

            {typeof props.readme === 'undefined' &&
              typeof props.readmeError === 'undefined' && (
                <StyledLoadingIndicator loading={true} />
              )}

            {props.readmeError}
          </Readme>
        )}
        <Details>
          <DetailGroup>
            <Detail>
              <small>CHART VERSION</small>
              <OptionalValue
                value={props.chartVersion}
                loaderWidth={200}
                loaderHeight={28}
              >
                {(value) => <Truncated as='span'>{value}</Truncated>}
              </OptionalValue>
            </Detail>

            <Detail>
              <small>CREATED</small>
              <OptionalValue
                value={props.createDate}
                loaderWidth={200}
                loaderHeight={28}
              >
                {(value) => <Date relative={true} value={value} />}
              </OptionalValue>
            </Detail>

            <Detail>
              <small>INCLUDES VERSION</small>
              <OptionalValue
                value={props.includesVersion}
                loaderWidth={200}
                loaderHeight={28}
              >
                {(value) => <Truncated as='span'>{value}</Truncated>}
              </OptionalValue>
            </Detail>
          </DetailGroup>

          <Detail>
            <small>DESCRIPTION</small>
            <OptionalValue
              value={props.description}
              loaderWidth={200}
              loaderHeight={28}
            >
              {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
              {(value) => <>{value}</>}
            </OptionalValue>
          </Detail>

          <Detail>
            <small>WEBSITE</small>
            <OptionalValue
              value={props.website}
              loaderWidth={200}
              loaderHeight={28}
            >
              {(value) => (
                <NonBreakingLink
                  href={value}
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {value} <i className='fa fa-open-in-new' />
                </NonBreakingLink>
              )}
            </OptionalValue>
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

export default AppDetail;
