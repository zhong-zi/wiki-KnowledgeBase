"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildSummary = buildSummary;
const audit_events_1 = require("../../../common/events/audit-events");
const ROLE_WORDS = {
    admin: 'admin',
    writer: 'editor',
    reader: 'viewer',
    owner: 'owner',
    member: 'member',
};
const ACCESS_WORDS = { writer: 'edit', reader: 'view' };
const TYPE_WORDS = {
    sso_provider: 'SSO provider',
    api_key: 'API key',
    scim_token: 'SCIM token',
    oauth_client: 'OAuth client',
    oauth_grant: 'OAuth grant',
    siem_destination: 'SIEM destination',
};
const VERB_SUFFIXES = [
    'added',
    'removed',
    'changed',
    'created',
    'updated',
    'deleted',
    'revoked',
    'resent',
    'enabled',
    'disabled',
    'generated',
    'registered',
    'requested',
    'rejected',
    'restored',
    'trashed',
    'imported',
    'exported',
    'verified',
    'restricted',
    'activated',
    'deactivated',
    'reset',
    'login',
    'logout',
];
const VERB_PHRASES = {
    login: 'signed in',
    logout: 'signed out',
};
function humanize(value) {
    return value.replace(/_/g, ' ');
}
function quote(value) {
    return `“${value}”`;
}
function text(bag, key) {
    const value = bag?.[key];
    return typeof value === 'string' && value ? value : null;
}
function scalar(bag, key) {
    const value = bag?.[key];
    if (typeof value === 'string')
        return value || null;
    if (typeof value === 'number' || typeof value === 'boolean')
        return String(value);
    return null;
}
function joined(bag, key) {
    const value = bag?.[key];
    return Array.isArray(value) && value.length > 0 ? value.join(', ') : null;
}
function has(bag, key) {
    return bag ? key in bag : false;
}
function keysOf(bag) {
    const keys = bag ? Object.keys(bag) : [];
    return keys.length > 0 ? keys.join(', ') : null;
}
function dateOnly(value) {
    if (typeof value !== 'string' && !(value instanceof Date))
        return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}
function roleWord(bag, key) {
    const role = text(bag, key);
    return role ? (ROLE_WORDS[role] ?? role) : null;
}
function accessWord(bag, key) {
    const role = text(bag, key);
    return role ? (ACCESS_WORDS[role] ?? role) : null;
}
function after(input) {
    return input.changes?.after;
}
function before(input) {
    return input.changes?.before;
}
function meta(input) {
    return input.metadata ?? undefined;
}
function actorOf(input) {
    return input.actorName ?? 'System';
}
function subjectOf(input) {
    return input.resource.name ?? text(after(input), 'name') ?? text(before(input), 'name');
}
function pageOf(input) {
    return (input.resource.name ??
        text(meta(input), 'pageTitle') ??
        text(after(input), 'title') ??
        text(before(input), 'title'));
}
function spaceOf(input) {
    return input.resource.name ?? input.space?.name ?? text(meta(input), 'spaceName');
}
function templateTitleOf(input) {
    return (input.resource.name ?? text(after(input), 'title') ?? text(before(input), 'title'));
}
function memberOf(input) {
    const principal = input.principal;
    if (!principal?.name)
        return null;
    return principal.type === 'group' ? `group ${quote(principal.name)}` : principal.name;
}
function contextPageOf(input) {
    return input.contextPage ? (input.contextPage.name ?? input.contextPage.id) : null;
}
function accountOf(input) {
    const account = after(input)?.account;
    return text(account, 'username') ?? text(account, 'displayName');
}
function pageSentence(input, sentence) {
    const page = pageOf(input);
    return page ? sentence(quote(page)) : null;
}
function renamed(input, noun) {
    const from = text(before(input), 'name');
    const to = text(after(input), 'name');
    return from && to
        ? `${actorOf(input)} renamed ${noun} ${quote(from)} to ${quote(to)}`
        : null;
}
function namedAfter(input, verb, noun) {
    const name = text(after(input), 'name');
    return name ? `${actorOf(input)} ${verb} ${noun} ${quote(name)}` : null;
}
function namedBefore(input, verb, noun) {
    const name = text(before(input), 'name');
    return name ? `${actorOf(input)} ${verb} ${noun} ${quote(name)}` : null;
}
const TEMPLATES = {
    [audit_events_1.AuditEvent.WORKSPACE_UPDATED]: (i) => {
        const retention = scalar(after(i), 'auditRetentionDays');
        if (retention) {
            const previous = scalar(before(i), 'auditRetentionDays');
            return previous
                ? `${actorOf(i)} changed audit log retention from ${previous} to ${retention} days`
                : null;
        }
        const name = text(after(i), 'name');
        if (name)
            return `${actorOf(i)} renamed the workspace to ${quote(name)}`;
        const keys = keysOf(after(i));
        return keys ? `${actorOf(i)} updated workspace settings: ${keys}` : null;
    },
    [audit_events_1.AuditEvent.WORKSPACE_INVITE_CREATED]: (i) => {
        const email = text(after(i), 'email');
        const role = roleWord(after(i), 'role');
        return email && role ? `${actorOf(i)} invited ${email} as ${role}` : null;
    },
    [audit_events_1.AuditEvent.WORKSPACE_INVITE_RESENT]: (i) => {
        const email = text(meta(i), 'email');
        return email ? `${actorOf(i)} resent the invitation to ${email}` : null;
    },
    [audit_events_1.AuditEvent.WORKSPACE_INVITE_REVOKED]: (i) => {
        const email = text(before(i), 'email');
        return email ? `${actorOf(i)} revoked the invitation to ${email}` : null;
    },
    [audit_events_1.AuditEvent.USER_CREATED]: (i) => {
        const subject = subjectOf(i);
        if (!subject)
            return null;
        if (i.actorName && i.actorName !== subject) {
            return `${i.actorName} created user ${subject}`;
        }
        const source = text(meta(i), 'source');
        if (source === 'invitation') {
            const role = roleWord(after(i), 'role');
            return role ? `${subject} accepted an invitation and joined as ${role}` : null;
        }
        if (source === 'sso' || source === 'google_signup') {
            const providerType = text(meta(i), 'providerType') ?? 'google';
            return `${subject} signed up via SSO (${providerType})`;
        }
        if (source === 'signup')
            return `${subject} signed up`;
        return null;
    },
    [audit_events_1.AuditEvent.USER_DELETED]: (i) => {
        const name = text(before(i), 'name');
        return name ? `${actorOf(i)} deleted user ${name}` : null;
    },
    [audit_events_1.AuditEvent.USER_LOGIN]: (i) => {
        const subject = subjectOf(i);
        if (!subject)
            return null;
        const source = text(meta(i), 'source');
        if (source === 'password')
            return `${subject} signed in via password`;
        if (source === 'mfa')
            return `${subject} signed in via password and MFA`;
        if (source === 'ldap')
            return `${subject} signed in via LDAP`;
        if (source === 'sso') {
            const providerType = text(meta(i), 'providerType');
            return providerType ? `${subject} signed in via SSO (${providerType})` : null;
        }
        return null;
    },
    [audit_events_1.AuditEvent.USER_LOGOUT]: (i) => `${actorOf(i)} signed out`,
    [audit_events_1.AuditEvent.USER_ROLE_CHANGED]: (i) => {
        const subject = subjectOf(i);
        const from = roleWord(before(i), 'role');
        const to = roleWord(after(i), 'role');
        return subject && from && to
            ? `${actorOf(i)} changed ${subject}'s workspace role from ${from} to ${to}`
            : null;
    },
    [audit_events_1.AuditEvent.USER_PASSWORD_CHANGED]: (i) => `${actorOf(i)} changed their password`,
    [audit_events_1.AuditEvent.USER_PASSWORD_RESET]: (i) => {
        const subject = subjectOf(i);
        return subject ? `${subject} reset their password` : null;
    },
    [audit_events_1.AuditEvent.USER_PASSWORD_RESET_REQUESTED]: (i) => {
        const subject = subjectOf(i);
        return subject ? `A password reset was requested for ${subject}` : null;
    },
    [audit_events_1.AuditEvent.USER_UPDATED]: (i) => {
        const nameChanged = has(after(i), 'name');
        const emailChanged = has(after(i), 'email');
        if (nameChanged && emailChanged) {
            const subject = subjectOf(i);
            return subject ? `${actorOf(i)} updated ${subject}'s name and email address` : null;
        }
        if (nameChanged)
            return renamed(i, 'user');
        if (emailChanged) {
            const subject = subjectOf(i);
            return subject ? `${actorOf(i)} changed ${subject}'s email address` : null;
        }
        return null;
    },
    [audit_events_1.AuditEvent.USER_DEACTIVATED]: (i) => {
        const name = text(before(i), 'name');
        return name ? `${actorOf(i)} deactivated user ${name}` : null;
    },
    [audit_events_1.AuditEvent.USER_ACTIVATED]: (i) => {
        const name = text(before(i), 'name');
        return name ? `${actorOf(i)} reactivated user ${name}` : null;
    },
    [audit_events_1.AuditEvent.USER_MFA_ENABLED]: (i) => {
        const subject = subjectOf(i);
        return subject ? `${subject} enabled two-factor authentication` : null;
    },
    [audit_events_1.AuditEvent.USER_MFA_DISABLED]: (i) => `${actorOf(i)} disabled two-factor authentication`,
    [audit_events_1.AuditEvent.USER_MFA_BACKUP_CODE_GENERATED]: (i) => `${actorOf(i)} generated new two-factor backup codes`,
    [audit_events_1.AuditEvent.API_KEY_CREATED]: (i) => {
        const created = namedAfter(i, 'created', 'API key');
        if (!created)
            return null;
        const expires = dateOnly(after(i)?.['expiresAt']);
        return expires ? `${created} expiring ${expires}` : created;
    },
    [audit_events_1.AuditEvent.API_KEY_UPDATED]: (i) => renamed(i, 'API key'),
    [audit_events_1.AuditEvent.API_KEY_DELETED]: (i) => namedBefore(i, 'deleted', 'API key'),
    [audit_events_1.AuditEvent.OAUTH_CLIENT_REGISTERED]: (i) => namedAfter(i, 'registered', 'OAuth client'),
    [audit_events_1.AuditEvent.OAUTH_GRANT_CREATED]: (i) => {
        const client = text(after(i), 'clientName');
        const scopes = joined(after(i), 'scopes');
        return client && scopes
            ? `${actorOf(i)} authorized ${quote(client)} for scopes ${scopes}`
            : null;
    },
    [audit_events_1.AuditEvent.OAUTH_GRANT_REVOKED]: (i) => {
        const clientId = text(before(i), 'clientId');
        const scopes = joined(before(i), 'scopes');
        return clientId && scopes
            ? `${actorOf(i)} revoked an OAuth grant for client ${clientId} (${scopes})`
            : null;
    },
    [audit_events_1.AuditEvent.INTEGRATION_INSTALLED]: (i) => {
        const provider = text(after(i), 'provider');
        if (!provider)
            return null;
        const account = accountOf(i);
        return `${actorOf(i)} installed the ${provider} integration${account ? ` as ${account}` : ''}`;
    },
    [audit_events_1.AuditEvent.INTEGRATION_UNINSTALLED]: (i) => {
        const provider = text(before(i), 'provider');
        return provider ? `${actorOf(i)} uninstalled the ${provider} integration` : null;
    },
    [audit_events_1.AuditEvent.INTEGRATION_CONNECTED]: (i) => {
        const provider = text(after(i), 'provider');
        if (!provider)
            return null;
        const account = accountOf(i);
        return `${actorOf(i)} connected their ${provider} account${account ? ` (${account})` : ''}`;
    },
    [audit_events_1.AuditEvent.INTEGRATION_DISCONNECTED]: (i) => {
        const provider = text(before(i), 'provider');
        return provider ? `${actorOf(i)} disconnected their ${provider} account` : null;
    },
    [audit_events_1.AuditEvent.SCIM_TOKEN_CREATED]: (i) => namedAfter(i, 'created', 'SCIM token'),
    [audit_events_1.AuditEvent.SCIM_TOKEN_DELETED]: (i) => namedBefore(i, 'deleted', 'SCIM token'),
    [audit_events_1.AuditEvent.SPACE_CREATED]: (i) => {
        const created = namedAfter(i, 'created', 'space');
        if (!created)
            return null;
        return after(i)?.['isPersonal'] ? `${created} (personal space)` : created;
    },
    [audit_events_1.AuditEvent.SPACE_UPDATED]: (i) => {
        if (has(after(i), 'name'))
            return renamed(i, 'space');
        const space = spaceOf(i);
        const keys = keysOf(after(i));
        return space && keys ? `${actorOf(i)} updated space ${quote(space)} (${keys})` : null;
    },
    [audit_events_1.AuditEvent.SPACE_DELETED]: (i) => namedBefore(i, 'deleted', 'space'),
    [audit_events_1.AuditEvent.SPACE_MEMBER_ADDED]: (i) => {
        const member = memberOf(i);
        const space = spaceOf(i);
        const role = roleWord(after(i), 'role');
        return member && space && role
            ? `${actorOf(i)} added ${member} to space ${quote(space)} as ${role}`
            : null;
    },
    [audit_events_1.AuditEvent.SPACE_MEMBER_REMOVED]: (i) => {
        const member = memberOf(i);
        const space = spaceOf(i);
        return member && space
            ? `${actorOf(i)} removed ${member} from space ${quote(space)}`
            : null;
    },
    [audit_events_1.AuditEvent.SPACE_MEMBER_ROLE_CHANGED]: (i) => {
        const member = memberOf(i);
        const space = spaceOf(i);
        const from = roleWord(before(i), 'role');
        const to = roleWord(after(i), 'role');
        return member && space && from && to
            ? `${actorOf(i)} changed ${member}'s role in space ${quote(space)} from ${from} to ${to}`
            : null;
    },
    [audit_events_1.AuditEvent.GROUP_CREATED]: (i) => namedAfter(i, 'created', 'group'),
    [audit_events_1.AuditEvent.GROUP_UPDATED]: (i) => {
        if (has(after(i), 'name'))
            return renamed(i, 'group');
        const group = i.resource.name;
        const keys = keysOf(after(i));
        return group && keys ? `${actorOf(i)} updated group ${quote(group)} (${keys})` : null;
    },
    [audit_events_1.AuditEvent.GROUP_DELETED]: (i) => namedBefore(i, 'deleted', 'group'),
    [audit_events_1.AuditEvent.GROUP_MEMBER_ADDED]: (i) => {
        const member = text(after(i), 'userName');
        const group = i.resource.name;
        return member && group
            ? `${actorOf(i)} added ${member} to group ${quote(group)}`
            : null;
    },
    [audit_events_1.AuditEvent.GROUP_MEMBER_REMOVED]: (i) => {
        const member = text(before(i), 'userName');
        const group = text(meta(i), 'groupName') ?? i.resource.name;
        return member && group
            ? `${actorOf(i)} removed ${member} from group ${quote(group)}`
            : null;
    },
    [audit_events_1.AuditEvent.COMMENT_UPDATED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} edited a comment on page ${quote(page)}` : null;
    },
    [audit_events_1.AuditEvent.COMMENT_RESOLVED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} resolved a comment on page ${quote(page)}` : null;
    },
    [audit_events_1.AuditEvent.COMMENT_REOPENED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} reopened a comment on page ${quote(page)}` : null;
    },
    [audit_events_1.AuditEvent.COMMENT_DELETED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} deleted a comment on page ${quote(page)}` : null;
    },
    [audit_events_1.AuditEvent.PAGE_TRASHED]: (i) => {
        const title = text(before(i), 'title');
        return title ? `${actorOf(i)} moved page ${quote(title)} to trash` : null;
    },
    [audit_events_1.AuditEvent.PAGE_DELETED]: (i) => {
        const title = text(before(i), 'title');
        return title ? `${actorOf(i)} permanently deleted page ${quote(title)}` : null;
    },
    [audit_events_1.AuditEvent.PAGE_RESTORED]: (i) => {
        const title = text(after(i), 'title');
        return title ? `${actorOf(i)} restored page ${quote(title)} from trash` : null;
    },
    [audit_events_1.AuditEvent.PAGE_RESTRICTED]: (i) => pageSentence(i, (page) => `${actorOf(i)} restricted access to page ${page}`),
    [audit_events_1.AuditEvent.PAGE_RESTRICTION_REMOVED]: (i) => pageSentence(i, (page) => `${actorOf(i)} removed the access restriction from page ${page}`),
    [audit_events_1.AuditEvent.PAGE_PERMISSION_ADDED]: (i) => {
        const member = memberOf(i);
        const access = accessWord(after(i), 'role');
        return member && access
            ? pageSentence(i, (page) => `${actorOf(i)} gave ${member} ${access} access to page ${page}`)
            : null;
    },
    [audit_events_1.AuditEvent.PAGE_PERMISSION_REMOVED]: (i) => {
        const member = memberOf(i);
        return member
            ? pageSentence(i, (page) => `${actorOf(i)} removed ${member}'s access to page ${page}`)
            : null;
    },
    [audit_events_1.AuditEvent.PAGE_PERMISSION_ROLE_CHANGED]: (i) => {
        const member = memberOf(i);
        const from = accessWord(before(i), 'role');
        const to = accessWord(after(i), 'role');
        return member && from && to
            ? pageSentence(i, (page) => `${actorOf(i)} changed ${member}'s access to page ${page} from ${from} to ${to}`)
            : null;
    },
    [audit_events_1.AuditEvent.PAGE_VERIFICATION_CREATED]: (i) => {
        const type = text(meta(i), 'type');
        if (!type)
            return null;
        const sentence = pageSentence(i, (page) => `${actorOf(i)} set up ${type} verification for page ${page}`);
        if (!sentence)
            return null;
        const amount = scalar(meta(i), 'periodAmount');
        const unit = text(meta(i), 'periodUnit');
        return amount && unit ? `${sentence} every ${amount} ${unit}` : sentence;
    },
    [audit_events_1.AuditEvent.PAGE_VERIFIED]: (i) => pageSentence(i, (page) => `${actorOf(i)} verified page ${page}`),
    [audit_events_1.AuditEvent.PAGE_APPROVAL_REQUESTED]: (i) => pageSentence(i, (page) => `${actorOf(i)} requested approval for page ${page}`),
    [audit_events_1.AuditEvent.PAGE_APPROVAL_REJECTED]: (i) => pageSentence(i, (page) => `${actorOf(i)} rejected the approval request for page ${page}`),
    [audit_events_1.AuditEvent.PAGE_MARKED_OBSOLETE]: (i) => pageSentence(i, (page) => `${actorOf(i)} marked page ${page} as obsolete`),
    [audit_events_1.AuditEvent.PAGE_VERIFICATION_UPDATED]: (i) => pageSentence(i, (page) => `${actorOf(i)} updated the verification settings of page ${page}`),
    [audit_events_1.AuditEvent.PAGE_VERIFICATION_REMOVED]: (i) => pageSentence(i, (page) => `${actorOf(i)} removed verification from page ${page}`),
    [audit_events_1.AuditEvent.SHARE_CREATED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} shared page ${quote(page)} publicly` : null;
    },
    [audit_events_1.AuditEvent.SHARE_DELETED]: (i) => {
        const page = contextPageOf(i);
        return page ? `${actorOf(i)} removed the public share of page ${quote(page)}` : null;
    },
    [audit_events_1.AuditEvent.PAGE_IMPORTED]: (i) => {
        const fileName = text(meta(i), 'fileName');
        const source = text(meta(i), 'source');
        const space = i.contextSpace?.name ?? null;
        return fileName && source && space
            ? `${actorOf(i)} imported ${fileName} (${source}) into space ${quote(space)}`
            : null;
    },
    [audit_events_1.AuditEvent.PAGE_EXPORTED]: (i) => {
        const title = text(meta(i), 'title');
        const format = text(meta(i), 'format');
        return title && format
            ? `${actorOf(i)} exported page ${quote(title)} as ${format}`
            : null;
    },
    [audit_events_1.AuditEvent.SPACE_EXPORTED]: (i) => {
        const space = text(meta(i), 'spaceName');
        const format = text(meta(i), 'format');
        return space && format
            ? `${actorOf(i)} exported space ${quote(space)} as ${format}`
            : null;
    },
    [audit_events_1.AuditEvent.SSO_PROVIDER_CREATED]: (i) => {
        const name = text(after(i), 'name');
        const type = text(after(i), 'type');
        return name && type
            ? `${actorOf(i)} created SSO provider ${quote(name)} (${type})`
            : null;
    },
    [audit_events_1.AuditEvent.SSO_PROVIDER_UPDATED]: (i) => {
        const name = i.resource.name;
        const keys = keysOf(after(i));
        return name && keys
            ? `${actorOf(i)} updated SSO provider ${quote(name)} (${keys})`
            : null;
    },
    [audit_events_1.AuditEvent.SSO_PROVIDER_DELETED]: (i) => {
        const name = text(before(i), 'name');
        const type = text(before(i), 'type');
        return name && type
            ? `${actorOf(i)} deleted SSO provider ${quote(name)} (${type})`
            : null;
    },
    [audit_events_1.AuditEvent.LICENSE_ACTIVATED]: (i) => {
        const customer = text(after(i), 'customerName');
        const seats = scalar(after(i), 'seatCount');
        const expires = dateOnly(after(i)?.['expiresAt']);
        return customer && seats && expires
            ? `${actorOf(i)} activated the enterprise licence for ${customer} (${seats} seats, expires ${expires})`
            : null;
    },
    [audit_events_1.AuditEvent.LICENSE_REMOVED]: (i) => {
        const removed = `${actorOf(i)} removed the enterprise licence`;
        const customer = text(meta(i), 'customerName');
        return customer ? `${removed} for ${customer}` : removed;
    },
    [audit_events_1.AuditEvent.SIEM_DESTINATION_CREATED]: (i) => {
        const name = text(after(i), 'name');
        const type = text(after(i), 'type');
        return name && type
            ? `${actorOf(i)} created SIEM destination ${quote(name)} (${type})`
            : null;
    },
    [audit_events_1.AuditEvent.SIEM_DESTINATION_UPDATED]: (i) => {
        const name = text(after(i), 'name') ?? i.resource.name;
        if (!name)
            return null;
        let sentence = `${actorOf(i)} updated SIEM destination ${quote(name)}`;
        const secrets = after(i)?.['secrets'];
        const rotated = secrets && typeof secrets === 'object'
            ? keysOf(secrets)
            : null;
        if (rotated)
            sentence += `, rotated ${rotated}`;
        const enabled = after(i)?.['enabled'];
        const wasEnabled = before(i)?.['enabled'];
        if (typeof enabled === 'boolean' && typeof wasEnabled === 'boolean' && enabled !== wasEnabled) {
            sentence += enabled ? ' (enabled)' : ' (disabled)';
        }
        return sentence;
    },
    [audit_events_1.AuditEvent.SIEM_DESTINATION_DELETED]: (i) => {
        const name = text(before(i), 'name');
        const type = text(before(i), 'type');
        return name && type
            ? `${actorOf(i)} deleted SIEM destination ${quote(name)} (${type})`
            : null;
    },
    [audit_events_1.AuditEvent.SIEM_DESTINATION_TEST]: (i) => {
        const name = i.resource.name;
        return name ? `${actorOf(i)} sent a test event to ${quote(name)}` : null;
    },
    [audit_events_1.AuditEvent.TEMPLATE_CREATED]: (i) => {
        const title = templateTitleOf(i);
        if (!title)
            return null;
        const created = `${actorOf(i)} created template ${quote(title)}`;
        const space = i.space?.name ?? i.contextSpace?.name;
        return space ? `${created} in space ${quote(space)}` : created;
    },
    [audit_events_1.AuditEvent.TEMPLATE_DELETED]: (i) => {
        const title = templateTitleOf(i);
        return title ? `${actorOf(i)} deleted template ${quote(title)}` : null;
    },
};
function verbPhrase(suffix) {
    for (const verb of VERB_SUFFIXES) {
        if (suffix !== verb && !suffix.endsWith(`_${verb}`))
            continue;
        const rest = suffix === verb ? '' : suffix.slice(0, suffix.length - verb.length - 1);
        const word = VERB_PHRASES[verb] ?? verb;
        return rest ? `${word} ${humanize(rest)}` : word;
    }
    return humanize(suffix);
}
function genericSummary(input) {
    const dot = input.event.indexOf('.');
    const suffix = dot >= 0 ? input.event.slice(dot + 1) : input.event;
    const label = input.resource.name
        ? quote(input.resource.name)
        : (input.resource.id ?? '');
    const type = TYPE_WORDS[input.resource.type] ?? humanize(input.resource.type);
    return `${actorOf(input)} ${verbPhrase(suffix)} ${type} ${label}`.trim();
}
function buildSummary(input) {
    return TEMPLATES[input.event]?.(input) ?? genericSummary(input);
}
//# sourceMappingURL=siem-summary.js.map