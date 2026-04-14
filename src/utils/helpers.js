/**
 * utils/helpers.js — General purpose helper functions
 */

export function capitalize(str = '') {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function truncate(str = '', maxLength = 60) {
    return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

export function getInitials(name = '') {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

export function scoreColor(score) {
    if (score >= 80) return 'var(--accent-green)';
    if (score >= 65) return 'var(--accent-cyan)';
    if (score >= 50) return 'var(--accent-amber)';
    if (score >= 35) return 'var(--accent-indigo)';
    return 'var(--accent-red)';
}

export function recommendationLabel(rec) {
    const map = {
        strong_yes: '✅ Strong Yes',
        yes: '👍 Yes',
        maybe: '🤔 Maybe',
        no: '👎 No',
        strong_no: '❌ Strong No',
    };
    return map[rec] || rec;
}

export function recommendationBadge(rec) {
    const map = {
        strong_yes: 'green',
        yes: 'cyan',
        maybe: 'amber',
        no: 'red',
        strong_no: 'red',
    };
    return map[rec] || 'indigo';
}

export function statusBadge(status) {
    const map = {
        scheduled: 'indigo',
        pending: 'amber',
        active: 'cyan',
        completed: 'green',
        cancelled: 'red',
        parsed: 'green',
        failed: 'red',
        processing: 'amber',
        complete: 'green',
    };
    return map[status] || 'indigo';
}
