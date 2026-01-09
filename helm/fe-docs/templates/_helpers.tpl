{{/*
Chart name helper
*/}}
{{- define "fe-docs.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Chart helper
*/}}
{{- define "fe-docs.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
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
