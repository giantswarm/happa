{{/*
Chart name helper
*/}}
{{- define "fe-docs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label. A label value is at
most 63 characters and begins and ends alphanumeric: the cut of a long version
(a branch build's <version>-dev.<branch>.<date>.<time>.<sha>, or the
<version>+<digest> helm-controller installs) can land on any run of ".", "_"
(from "+") and "-", so the whole run is trimmed.
*/}}
{{- define "fe-docs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimAll "-._" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "commonLabels" -}}
app.kubernetes.io/name: {{ include "fe-docs.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
helm.sh/chart: {{ include "fe-docs.chart" . }}
{{- if .Chart.Annotations }}
application.giantswarm.io/team: {{ index .Chart.Annotations "io.giantswarm.application.team" | quote }}
{{- end }}
{{- end -}}

{{/*
Legacy common labels (for backwards compatibility)
*/}}
{{- define "labels.common" -}}
app: {{ include "fe-docs.name" . | quote }}
{{ include "commonLabels" . }}
{{- end -}}
