import styled from '@emotion/styled';
import { executeUpdate } from 'actions/metadataActions';
import FooterUpdateButton from 'Footer/FooterUpdateButton';
import {
  getReleaseURL,
  getVersionTooltipMessage,
  hasUpdateReady,
} from 'Footer/FooterUtils';
import FooterVersion from 'Footer/FooterVersion';
import React, { useCallback } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import {
  getMetadataCurrentVersion,
  getMetadataIsUpdating,
  getMetadataNewVersion,
} from 'selectors/metadataSelectors';

const StyledFooter = styled.footer`
  & > span + span {
    margin-left: 0.35rem;
  }
`;

interface IFooterProps extends React.ComponentPropsWithoutRef<'footer'> {}

const Footer: React.FC<IFooterProps> = (props: IFooterProps) => {
  const dispatch = useDispatch();

  const currentVersion: string = useSelector(getMetadataCurrentVersion);
  const newVersion: string | null = useSelector(getMetadataNewVersion);
  const isUpdating: boolean = useSelector(getMetadataIsUpdating);

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

  return (
    <StyledFooter className='col-9' {...props}>
      <span>Happa</span>
      <span>
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
      </span>
      <span>&#183;</span>
      <span>
        <FooterUpdateButton
          hasUpdateReady={isUpdateReady}
          isUpdating={isUpdating}
          releaseURL={releaseURL}
          onClick={handleUpdate}
        />
      </span>
    </StyledFooter>
  );
};

export default Footer;
