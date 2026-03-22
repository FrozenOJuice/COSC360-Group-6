export function toPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function normalizeTextSearch(value, options = {}) {
    const search = typeof value === "string" ? value.trim() : "";
    const maxLength = Number.isInteger(options.maxLength) && options.maxLength > 0
        ? options.maxLength
        : 80;
    const maxTerms = Number.isInteger(options.maxTerms) && options.maxTerms > 0
        ? options.maxTerms
        : 6;
    const minTermLength = Number.isInteger(options.minTermLength) && options.minTermLength > 0
        ? options.minTermLength
        : 2;

    if (!search) {
        return "";
    }

    const normalizedSearch = search.replace(/\s+/g, " ").slice(0, maxLength);
    const terms = normalizedSearch
        .split(" ")
        .map((term) => term.replace(/^[-]+/, "").replace(/["']/g, ""))
        .filter((term) => term.length >= minTermLength)
        .slice(0, maxTerms);

    return terms.join(" ");
}
