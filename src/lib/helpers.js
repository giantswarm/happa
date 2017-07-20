'use strict';
import validate from 'validate.js';
import moment from 'moment';
import React from 'react';
import {OverlayTrigger, Tooltip} from 'react-bootstrap/lib';
import _ from 'underscore';

export function dedent(strings, ...values) {
  let raw;
  if (typeof strings === 'string') {
    // dedent can be used as a plain function
    raw = [strings];
  } else {
    raw = strings.raw;
  }

  // first, perform interpolation
  let result = '';
  for (let i = 0; i < raw.length; i++) {
    result += raw[i].


      // handle escaped backticks
      replace(/\\`/g, '`');

    if (i < values.length) {
      result += values[i];
    }
  }

  // now strip indentation
  const lines = result.split('\n');
  let mindent = null;
  lines.forEach(l => {
    let m = l.match(/^(\s+)\S+/);
    if (m) {
      let indent = m[1].length;
      if (!mindent) {
        // this is the first indented line
        mindent = indent;
      } else {
        mindent = Math.min(mindent, indent);
      }
    }
  });

  if (mindent !== null) {
    result = lines.map(l => l[0] === ' ' ? l.slice(mindent) : l).join('\n');
  }

  // dedent eats leading and trailing whitespace too
  result = result.trim();

  // handle escaped newlines at the end to ensure they don't get stripped too
  return result.replace(/\\n/g, '\n');
}

export function humanFileSize(bytes, si=true, decimals=1) {
    // http://stackoverflow.com/questions/10420352/converting-file-size-in-bytes-to-human-readable
    var thresh = si ? 1000 : 1024;

    if(Math.abs(bytes) < thresh) {
      return {
        value: bytes.toFixed(decimals),
        unit: 'B'
      };
    }

    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

    var u = -1;

    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);

    return {
      value: bytes.toFixed(decimals),
      unit: units[u]
    };
}

// validateOrRaise
// ----------------
// Helper method that validates an object based on constraints.
// Raises a TypeError with helpful message if the validation fails.
//
export function validateOrRaise(validatable, constraints) {
  var validationErrors = validate(validatable, constraints, {fullMessages: false});

  if(validationErrors){
    // If there are validation errors, throw a TypeError that has readable
    // information about what went wrong.
    var messages = _.map(validationErrors, (errorMessages, field) => {
      return field + ': ' + errorMessages.join(', ');
    });
    throw(new TypeError(messages.join('\n')));
  }
}

export function formatDate(ISO8601DateString) {
  // http://momentjs.com/docs/#/displaying/
  return moment(ISO8601DateString).utc().format('D MMM YYYY, HH:mm z');
}

export function relativeDate(ISO8601DateString) {
  var formatedDate = formatDate(ISO8601DateString);
  var relativeDate = moment(ISO8601DateString).utc().fromNow();

  return <OverlayTrigger placement="top" overlay={
    <Tooltip id="tooltip">{formatedDate}</Tooltip>
  }>
    <span>{relativeDate}</span>
  </OverlayTrigger>;
}

export function toTitleCase(str) {
  // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
  return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

export function  truncate(string, maxLength=20) {
  if (string.length > maxLength) {
    return string.substring(0,maxLength) + '\u2026';
  } else {
    return string;
  }
}

export function makeKubeConfigTextFile(cluster, keyPairResult) {
  return `
    apiVersion: v1
    kind: Config
    clusters:
    - cluster:
        certificate-authority-data: ${btoa(keyPairResult.certificate_authority_data)}
        server: ${cluster.api_endpoint}
      name: ${cluster.name}
    contexts:
    - context:
        cluster: ${cluster.name}
        user: "giantswarm-default"
      name: giantswarm-default
    current-context: giantswarm-default
    users:
    - name: "giantswarm-default"
      user:
        client-certificate-data: ${btoa(keyPairResult.client_certificate_data)}
        client-key-data: ${btoa(keyPairResult.client_key_data)}
    `;
}

// clustersForOrg takes a orgId and a list of clusters and returns just the clusters
// that are owned by that orgId
export function clustersForOrg(orgId, allClusters) {
  var clusters = [];

  clusters = _.filter(allClusters, (cluster) => {
    return cluster.owner === orgId;
  });

  return clusters;
}
