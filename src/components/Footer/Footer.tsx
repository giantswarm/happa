import styled from '@emotion/styled';
import { executeUpdate } from 'actions/metadataActions';
import FooterUpdateButton from 'Footer/FooterUpdateButton';
import {
  getReleaseURL,
  getVersionTooltipMessage,
  hasUpdateReady,
  showUpdateToast,
} from 'Footer/FooterUtils';
import FooterVersion from 'Footer/FooterVersion';
import usePrevious from 'lib/effects/usePrevious';
import React, { useCallback, useEffect } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMetadataCurrentVersion,
  getMetadataIsUpdating,
  getMetadataNewVersion,
} from 'selectors/metadataSelectors';

const FooterGroup = styled.span`
  & + & {
    margin-left: 0.35rem;
  }
`;

interface IFooterProps extends React.ComponentPropsWithoutRef<'footer'> {}

const Footer: React.FC<IFooterProps> = (props: IFooterProps) => {
  const dispatch = useDispatch();

  const currentVersion: string = useSelector(getMetadataCurrentVersion);
  const newVersion: string | null = useSelector(getMetadataNewVersion);
  const isUpdating: boolean = useSelector(getMetadataIsUpdating);

  const prevUpdatedVersion: string | null | undefined = usePrevious(newVersion);

  const tooltipMessage: string = getVersionTooltipMessage(
    currentVersion,
    newVersion,
    isUpdating
  );
  const releaseURL: string = getReleaseURL(currentVersion);
  const isUpdateReady: boolean = hasUpdateReady(currentVersion, newVersion);

  const handleUpdate = useCallback(() => {
    dispatch(executeUpdate());
  }, [dispatch]);

  useEffect(() => {
    if (isUpdateReady && newVersion !== prevUpdatedVersion) {
      showUpdateToast();
    }
  }, [isUpdateReady, newVersion, prevUpdatedVersion]);

  return (
    <footer className='col-9' {...props}>
      <FooterGroup>Happa</FooterGroup>
      <FooterGroup>
        <OverlayTrigger
          overlay={<Tooltip id='tooltip'>{tooltipMessage}</Tooltip>}
          placement='top'
        >
          <span>
            <FooterVersion
              currentVersion={currentVersion}
              hasUpdateReady={isUpdateReady}
              isUpdating={isUpdating}
            />
          </span>
        </OverlayTrigger>
      </FooterGroup>
      <FooterGroup>&#183;</FooterGroup>
      <FooterGroup>
        <FooterUpdateButton
          hasUpdateReady={isUpdateReady}
          isUpdating={isUpdating}
          releaseURL={releaseURL}
          onClick={handleUpdate}
        />
      </FooterGroup>
    </footer>
  );
};

export default Footer;
