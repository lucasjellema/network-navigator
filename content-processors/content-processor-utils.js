export const determineLimit = (limit, defaultLimit) => {
    // if limit is string then convert to number; note: empty string?
    if (limit === '') return defaultLimit
    if (typeof limit === 'string') {
        limit = parseInt(limit)
    }
    if (limit < 0) return 0
    return limit
}