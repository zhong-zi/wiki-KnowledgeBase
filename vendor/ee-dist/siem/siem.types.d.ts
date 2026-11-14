export type SiemDestinationType = 'http' | 'splunk_hec' | 'datadog';
export type SiemDestinationStatus = 'healthy' | 'failing';
export type TlsOptions = {
    rejectUnauthorized: boolean;
};
export type HttpConfig = {
    url: string;
    authHeaderName: string;
    authHeaderPrefix: string;
    format: 'json' | 'ndjson';
    tls?: TlsOptions;
};
export type SplunkHecConfig = {
    url: string;
    index?: string;
    source: string;
    sourcetype: string;
    host?: string;
    channelId: string;
    tls?: TlsOptions;
};
export declare const DATADOG_SITES: readonly ["datadoghq.com", "datadoghq.eu", "us3.datadoghq.com", "us5.datadoghq.com", "ap1.datadoghq.com", "ddog-gov.com"];
export type DatadogSite = (typeof DATADOG_SITES)[number];
export type DatadogConfig = {
    site: DatadogSite;
    service: string;
    tags?: string;
};
export type SiemConfig = HttpConfig | SplunkHecConfig | DatadogConfig;
export type HttpSecrets = {
    token?: string;
};
export type SplunkHecSecrets = {
    token: string;
};
export type DatadogSecrets = {
    apiKey: string;
};
export type SiemSecrets = HttpSecrets | SplunkHecSecrets | DatadogSecrets;
export type SiemWorkspace = {
    id: string;
    name: string | null;
    hostname: string | null;
};
export type SiemActor = {
    type: 'user' | 'system' | 'api_key';
    id: string | null;
    name: string | null;
    email: string | null;
};
export type SiemPrincipal = {
    type: 'user' | 'group';
    id: string;
    name: string | null;
};
export type SiemResource = {
    type: string;
    id: string | null;
    name: string | null;
    url?: string;
};
export type SiemSpace = {
    id: string;
    name: string | null;
    slug: string | null;
};
export type SiemTruncated = {
    _truncated: true;
};
export type SiemEvent = {
    id: string;
    schema_version: 1;
    timestamp: string;
    event: string;
    summary: string;
    workspace: SiemWorkspace;
    actor: SiemActor | null;
    principal: SiemPrincipal | null;
    resource: SiemResource | null;
    space: SiemSpace | null;
    changes: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
    } | SiemTruncated | null;
    metadata: Record<string, unknown> | SiemTruncated | null;
    client: {
        ip: string | null;
        userAgent: string | null;
    };
};
export type WorkspaceSummary = {
    id: string;
    name: string | null;
    hostname: string | null;
};
export type ResolvedDestination = {
    id: string;
    workspaceId: string;
    name: string;
    type: SiemDestinationType;
    enabled: boolean;
    config: SiemConfig;
    secrets: SiemSecrets;
};
export type SiemDestinationView = {
    id: string;
    name: string;
    type: SiemDestinationType;
    enabled: boolean;
    status: SiemDestinationStatus;
    config: SiemConfig;
    hasSecrets: Record<string, boolean>;
    cursorCreatedAt: Date;
    lastDeliveredAt: Date | null;
    lastError: string | null;
    lastErrorAt: Date | null;
    consecutiveFailures: number;
    nextAttemptAt: Date | null;
    failingSince: Date | null;
    createdAt: Date;
    updatedAt: Date;
};
export type SiemTestResult = {
    delivered: boolean;
    error?: string;
    statusCode?: number;
};
