// Full page loads: the layout then asks again who is signed in.
// In their own module so tests can replace them (jsdom cannot load pages).
export function goTo(path) {
    window.location.assign(path);
}

export function reload() {
    window.location.reload();
}
