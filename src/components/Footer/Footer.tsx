import styled from '@emotion/styled';
import FooterUpdateButton from 'Footer/FooterUpdateButton';
import {
  getReleaseURL,
  getVersionTooltipMessage,
  hasUpdateReady,
  showUpdateToast,
} from 'Footer/FooterUtils';
import FooterVersion from 'Footer/FooterVersion';
import React, { useCallback, useEffect, useRef } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import { useDispatch, useSelector } from 'react-redux';
import { selectLoadingFlagByAction } from 'selectors/clusterSelectors';
import * as metadataActions from 'stores/metadata/actions';
import { METADATA_UPDATE_EXECUTE_REQUEST } from 'stores/metadata/constants';
import {
  getMetadataCurrentVersion,
  getMetadataNewVersion,
} from 'stores/metadata/selectors';

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
  const isUpdating: boolean | null = useSelector((state) =>
    selectLoadingFlagByAction(state, METADATA_UPDATE_EXECUTE_REQUEST)
  );

  const isToastVisible: React.MutableRefObject<boolean> = useRef<boolean>(
    false
  );

  const tooltipMessage: string = getVersionTooltipMessage(
    currentVersion,
    newVersion,
    Boolean(isUpdating)
  );
  const releaseURL: string = getReleaseURL(currentVersion);
  const isUpdateReady: boolean = hasUpdateReady(currentVersion, newVersion);

  const handleUpdate = useCallback(() => {
    dispatch(metadataActions.executeUpdate());
  }, [dispatch]);

  useEffect(() => {
    dispatch(metadataActions.setInitialVersion());
    dispatch(metadataActions.registerUpdateChecker());
  }, [dispatch]);

  useEffect(() => {
    if (isUpdateReady && !isToastVisible.current) {
      showUpdateToast(() => {
        isToastVisible.current = false;
      });
      isToastVisible.current = true;
    }
  }, [isUpdateReady, newVersion]);

  return (
    <footer {...props}>
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
            />
          </span>
        </OverlayTrigger>
      </FooterGroup>

      {!isUpdateReady && <FooterGroup>&#183;</FooterGroup>}

      <FooterGroup>
        <FooterUpdateButton
          hasUpdateReady={isUpdateReady}
          isUpdating={Boolean(isUpdating)}
          releaseURL={releaseURL}
          onClick={handleUpdate}
        />
      </FooterGroup>
    </footer>
  );
};

export default Footer;
