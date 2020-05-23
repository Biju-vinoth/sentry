import React from 'react';
import {Link} from 'react-router';
import queryString from 'query-string';
import {Query, Location} from 'history';

import {EventTag, Meta} from 'app/types';
import AnnotatedText from 'app/components/events/meta/annotatedText';
import DeviceName from 'app/components/deviceName';
import {isUrl} from 'app/utils';
import Pill from 'app/components/pill';
import VersionHoverCard from 'app/components/versionHoverCard';
import TraceHoverCard from 'app/utils/discover/traceHoverCard';
import InlineSvg from 'app/components/inlineSvg';
import Version from 'app/components/version';
import {IconOpen} from 'app/icons';

type Props = {
  tag: EventTag;
  streamPath: string;
  releasesPath: string;
  query: Query;
  location: Location;
  orgId: string;
  projectId: string;
  meta: Meta;
};

const EventTagsPill = ({
  tag,
  query,
  orgId,
  projectId,
  streamPath,
  releasesPath,
  meta,
  location,
}: Props) => {
  const locationSearch = `?${queryString.stringify(query)}`;
  const isRelease = tag.key === 'release';
  const isTrace = tag.key === 'trace';
  return (
    <Pill key={tag.key} name={tag.key} value={tag.value}>
      <Link
        to={{
          pathname: streamPath,
          search: locationSearch,
        }}
      >
        {isRelease ? (
          <Version version={tag.value} anchor={false} tooltipRawVersion truncate />
        ) : (
          <DeviceName value={tag.value}>
            {deviceName => <AnnotatedText value={deviceName} meta={meta} />}
          </DeviceName>
        )}
      </Link>
      {isUrl(tag.value) && (
        <a href={tag.value} className="external-icon">
          <IconOpen size="xs" />
        </a>
      )}
      {isRelease && (
        <VersionHoverCard
          containerClassName="pill-icon"
          version={tag.value}
          orgId={orgId}
          projectId={projectId}
        >
          <Link
            to={{
              pathname: `${releasesPath}${tag.value}/`,
              search: locationSearch,
            }}
          >
            <InlineSvg src="icon-circle-info" size="14px" />
          </Link>
        </VersionHoverCard>
      )}
      {isTrace && (
        <TraceHoverCard
          containerClassName="pill-icon"
          traceId={tag.value}
          orgId={orgId}
          projectId={projectId}
          location={location}
        >
          {({to}) => {
            return (
              <Link to={to}>
                <InlineSvg src="icon-circle-info" size="14px" />
              </Link>
            );
          }}
        </TraceHoverCard>
      )}
    </Pill>
  );
};

export default EventTagsPill;
