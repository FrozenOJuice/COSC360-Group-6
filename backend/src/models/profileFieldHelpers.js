export const URL_OR_APP_PATH_PATTERN = /^(#|\/|https?:\/\/)/;
export const PHONE_PATTERN = /^[0-9+().\-\s]+$/;

export function trimStringArray(values) {
    if (!Array.isArray(values)) {
        return values;
    }

    return values
        .map((value) => (typeof value === "string" ? value.trim() : value))
        .filter((value) => typeof value === "string" && value.length > 0);
}

export function buildStringArrayField(fieldName) {
    return {
        type: [{
            type: String,
            trim: true,
            minlength: [1, `${fieldName} entries cannot be empty`],
            maxlength: [160, `${fieldName} entries must be at most 160 characters`],
        }],
        default: [],
        set: trimStringArray,
        validate: {
            validator: (value) => Array.isArray(value) && value.length <= 20,
            message: `${fieldName} can contain at most 20 entries`,
        },
    };
}

export function allowOptionalUrlOrAppPath(value) {
    return value == null || value === "" || URL_OR_APP_PATH_PATTERN.test(value);
}

export function allowOptionalPhone(value) {
    return value == null || value === "" || PHONE_PATTERN.test(value);
}
