# Security Review: License and Entitlement Enforcement

## Scope

Reviewed the license and entitlement flow visible in the checked-out workspace, with attention to the server-side enforcement of workspace features. The self-hosted license implementation under `apps/server/src/ee` is not present in this checkout, so its activation and cryptographic verification could not be assessed.

## Findings

### MEDIUM — SSO/MFA enforcement settings lack server-side entitlement checks

- **Location:** `apps/server/src/core/workspace/services/workspace.service.ts:319-326, 724-727`
- **Confidence:** 9/10
- **Details:** The workspace update path validates that an SSO provider exists when `enforceSso` is enabled, then passes the workspace update DTO to persistence. It does not check the `SSO_CUSTOM` or `MFA` entitlement before persisting `enforceSso` or `enforceMfa`. The client disables these controls when the relevant entitlement is absent, but client-side gating is not authoritative.
- **Impact:** A workspace settings manager may be able to enable these enforcement settings without the corresponding entitlement by calling the workspace update endpoint directly.
- **Recommendation:** Check the corresponding entitlement on the server before persisting either setting, and reject unauthorized changes with the repository's standard forbidden response.

## High-level license flow

The client requests workspace entitlements from `/workspace/entitlements`. The server resolves the tier and feature list using the workspace's stored license key for self-hosted instances, or the cloud plan for cloud instances. The client uses that response to gate feature visibility and controls. The server also performs entitlement checks in selected feature operations.

Because the self-hosted license service is absent from this checkout, this review makes no conclusion about license-key signing, activation, or tamper resistance.
