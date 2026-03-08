const UNIT_TO_MS = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
};

export const durationToMs = (value) => {
    const amount = Number(value.slice(0, -1));
    const unit = value.slice(-1);
    const ms = amount * UNIT_TO_MS[unit];
    return ms;
};