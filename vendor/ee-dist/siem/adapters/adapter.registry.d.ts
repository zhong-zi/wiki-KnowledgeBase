import { SiemAdapter } from './adapter.types';
import { HttpAdapter } from './http.adapter';
import { SplunkHecAdapter } from './splunk-hec.adapter';
import { DatadogAdapter } from './datadog.adapter';
import { SiemDestinationType } from '../siem.types';
export declare class SiemAdapterRegistry {
    private readonly adapters;
    constructor(http: HttpAdapter, splunk: SplunkHecAdapter, datadog: DatadogAdapter);
    get(type: SiemDestinationType): SiemAdapter;
}
