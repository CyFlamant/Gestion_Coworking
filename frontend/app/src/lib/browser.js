// Full page load at the given path: the layout then asks again who is signed in.
// In its own module so tests can replace it (jsdom cannot load pages).
export function goTo(path) {
    window.location.assign(path);
}
