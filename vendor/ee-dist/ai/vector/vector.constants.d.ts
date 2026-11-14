export declare const VECTOR_DRIVER_TOKEN = "VECTOR_DRIVER_TOKEN";
export declare enum VectorDriverName {
    PGVECTOR = "pgvector",
    TURBOPUFFER = "turbopuffer"
}
export declare const VECTOR_SEARCH_LIMIT = 20;
export declare const VECTOR_SEARCH_MAX_DISTANCE = 0.9;
export declare const TURBOPUFFER_MAX_RETRIES = 3;
export declare const TURBOPUFFER_QUERY_TIMEOUT_MS = 10000;
export declare const TURBOPUFFER_WRITE_TIMEOUT_MS = 60000;
export declare const VECTOR_PREWARM_TTL_MS: number;
export declare const EMBED_RESUME_CLOCK_SKEW_MS: number;
