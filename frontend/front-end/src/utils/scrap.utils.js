
export function eqSet(as, bs) {
    return as.size === bs.size && all(isIn(bs), as);
}

export function all(pred, as) {
    for (var a of as) if (!pred(a)) return false;
    return true;
}

export function isIn(as) {
    return function (a) {
        return as.has(a);
    };
}