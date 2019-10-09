{{- define "whitelistCIDR" -}}

{{- $CIDRs := dict "whitelist" (list) -}}

{{- range list .Values.Installation.V1.Security.Subnet.VPN .Values.Installation.V1.Security.Subnet.Customer.Public .Values.Installation.V1.Security.Subnet.Customer.Private -}}
    {{- range $i, $e := (split "," .) -}}
        {{- if and $e (not (has $e $CIDRs.whitelist)) -}}
            {{- $noop := append $CIDRs.whitelist $e | set $CIDRs "whitelist" -}}
        {{- end -}}
    {{- end -}}
{{- end -}}

{{- join "," $CIDRs.whitelist -}}

{{- end -}}
