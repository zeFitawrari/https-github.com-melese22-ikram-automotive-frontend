// scripts/font-mocks.js
// Serves @font-face stubs for any Google Fonts URL so `next build` succeeds
// offline. Enabled via NEXT_FONT_GOOGLE_MOCKED_RESPONSES in gate.sh and
// init-baseline.sh. Falls back to Arial at render time.

const css = '@font-face { font-family: Mocked; font-style: normal; font-weight: 400 700; src: local(Arial); }';

const mockedResponses = new Proxy({}, {
  get: (target, prop) => {
    if (prop === 'default') return mockedResponses;
    if (prop === '__esModule') return true;
    return css;
  },
});

module.exports = mockedResponses;
module.exports.default = mockedResponses;
