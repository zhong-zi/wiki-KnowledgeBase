export declare function redactSecrets(message: string, secrets?: Record<string, unknown>): string;
export declare function sanitiseError(err: unknown, secrets?: Record<string, unknown>, maxLength?: number): string;
