import FooterUpdateButton from 'Footer/FooterUpdateButton';
import {
  getReleaseURL,
  getVersionTooltipMessage,
  hasUpdateReady,
  showUpdateToast,
} from 'Footer/FooterUtils';
import FooterVersion from 'Footer/FooterVersion';
import { selectLoadingFlagByAction } from 'model/stores/loading/selectors';
import { getLoggedInUser } from 'model/stores/main/selectors';
import * as metadataActions from 'model/stores/metadata/actions';
import { METADATA_UPDATE_EXECUTE_REQUEST } from 'model/stores/metadata/constants';
import {
  getMetadataCurrentVersion,
  getMetadataNewVersion,
} from 'model/stores/metadata/selectors';
import { IState } from 'model/stores/state';
import React, { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const FooterGroup = styled.span`
  & + & {
    margin-left: 0.35rem;
  }
`;

interface IFooterProps extends React.ComponentPropsWithoutRef<'footer'> {}

const Footer: React.FC<React.PropsWithChildren<IFooterProps>> = (
  props: IFooterProps
) => {
  const dispatch = useDispatch();

  const currentVersion: string = useSelector(getMetadataCurrentVersion);
  const newVersion: string | null = useSelector(getMetadataNewVersion);
  const isUpdating = useSelector<IState, boolean | null>((state) =>
    selectLoadingFlagByAction(state, METADATA_UPDATE_EXECUTE_REQUEST)
  );

  const isToastVisible: React.MutableRefObject<boolean> =
    useRef<boolean>(false);

  const releaseURL: string = getReleaseURL(currentVersion);
  const isLoggedIn: boolean = useSelector<IState>(getLoggedInUser) !== null;
  const isUpdateReady: boolean = hasUpdateReady(
    currentVersion,
    newVersion,
    isLoggedIn
  );
  const tooltipMessage: string = getVersionTooltipMessage(
    isUpdateReady,
    Boolean(isUpdating)
  );

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
      <FooterGroup>Giant Swarm web interface</FooterGroup>
      <FooterGroup>
        <TooltipContainer content={<Tooltip>{tooltipMessage}</Tooltip>}>
          <span>
            <FooterVersion
              currentVersion={currentVersion}
              hasUpdateReady={isUpdateReady}
            />
          </span>
        </TooltipContainer>
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
