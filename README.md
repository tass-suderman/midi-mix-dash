# MIDI Workbench

A local React + Material UI editor for a ZSA Moonlander MIDI layer and an Akai MIDImix, styled and organized to match `../tass-suderman-portfolio-react`. It uses the same navy backgrounds, lavender text, purple borders, flat Material UI surfaces, and rounded buttons.

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. `pnpm build` produces the static application in `dist/`; `pnpm preview` serves it.

## Editing

- The Moonlander view follows the 72-key `LAYOUT_moonlander` argument order. Click a key to assign a MIDI note, a special command, or an existing QMK macro. Layer 14 is managed; the other layers and tap-dance implementations are retained.
- The MIDImix view provides 24 knobs, 9 faders, and 19 buttons. Send All is shown as a hardware utility. Factory MIDI addresses are supplied; the address disclosure lets you match customized hardware. This app does not program the MIDImix itself.
- Mapping colors: blue = MIDI note, red = Mixxx mapping, purple = both, white = special command. Mapping labels and tooltips also convey the state.
- Select a Mixxx action and destination deck. Buttons support toggle, hold, a repeatable trigger pulse, or a fixed native control value. Knobs/faders use `engine.setParameter` with normalized incoming MIDI values. Custom group/control names are supported.
- Actions are grouped into transport, mixer/EQ, hotcues/loops, effects, samplers, master/headphones, and library/Auto DJ. Context fields select decks, hotcue numbers, loop lengths, effect units/slots/parameters, and samplers. Knobs/faders offer continuous actions; button-only actions are disabled for them.
- The Moonlander graphic mirrors both halves, leaves the inner row gaps, and places the larger keys above the thumb keys. Display geometry is separate from firmware order, including for existing saved projects.
- Save commits an individual control; Cancel discards its draft. The project exists only in the current tab’s memory. Refreshing or closing the tab clears it. Download a ZIP to save your work; there is no autosave.

## Import and export

The workspace starts empty and never loads bundled examples or previous sessions. Import your own source ZIP or Mixxx controller files. Either device can be used independently. Moonlander controller files imported without firmware appear as MIDI-address cards until a source ZIP supplies their physical key positions. The supplied repository files remain useful as explicit test fixtures, but they are not served with the application. Legacy Moonlander headphone mappings are translated to Mixxx’s deck `pfl` control.

Import an Oryx **source ZIP** containing one `keymap.c`, `config.h`, and `rules.mk`. Compiled binaries cannot be edited. Layer 14 must use `LAYOUT_moonlander` with 72 arguments. The source ZIP's current layer is displayed as imported; it is not silently replaced by the example MIDI layout.

Import one Mixxx XML preset and its referenced JavaScript files together, choosing the destination device. The supplied legacy Moonlander callbacks and Workbench-generated scripts are understood. Other scripts are retained as opaque files, never executed in the browser; their behavior is not visually editable. Unmatched XML controls and outputs are preserved. For a complete editable round trip, import the exported Workbench ZIP.

Downloads contain:

- `firmware/midi_workbench/`: updated source. Copy into `keyboards/zsa/moonlander/keymaps/` in a compatible ZSA QMK checkout and compile for your hardware revision, for example `qmk compile -kb zsa/moonlander/reva -km midi_workbench`. Flash the resulting binary using your normal workflow.
- `mixxx/`: presets and scripts. Copy the whole directory's contents into your Mixxx user controllers directory, restart Mixxx, select the Workbench presets, and enable both controllers.
- `midi-workbench.json`: editable project state.
- `README.txt`: installation instructions.

The exporter sets `MIDI_ENABLE = yes`, `MIDI_ADVANCED`, and startup octave/channel/transpose. The note calculation is `12 × octave offset + QMK note offset`; the UI displays scientific pitch notation, decimal, and hex. Runtime octave/channel/transpose commands can move notes away from the exported mappings. `MI_ON` / `MI_OFF` control basic QMK MIDI mode; advanced note keycodes send MIDI independently.

This is a static, browser-only application. It does not compile or flash firmware, write into Mixxx's directory, or require a server/account. Physical device behavior needs validation on your setup.

## License and privacy

The application uses GNU AGPL v3; see `LICENSE.md`. The Information tab links the license and the corresponding application source. Each build generates a static `source.zip` containing the current application and build files. This archive excludes local firmware/controller samples, imported projects, environment files, and Git metadata.

See [the privacy policy](PRIVACY.md). There are no application database calls, analytics integrations, upload endpoints, or persistent browser saves. The only local-storage operation removes the old `midi-workbench-v1` autosave. Downloads are the user's own files; browsers may still cache application assets.

Vercel's infrastructure records traffic/operational metadata even without Web Analytics. The policy explicitly distinguishes that hosting behavior from this application's treatment of project data. No Vercel account settings were changed. Keep Web Analytics, Speed Insights, injected tracking scripts, and integrations disabled if you want to preserve this application's privacy behavior. `vercel.json` deploys static Vite output and sets `connect-src 'none'`, blocking application fetch/XHR/WebSocket connections in production; it cannot disable infrastructure logging. The development server's local HMR connection is not a project-data upload.

## Code conventions

The application follows the React portfolio's arrow-function components, typed props, default component exports, semantic Material UI palette keys, and `sx` styling for shared components. Formatting uses tabs, single quotes, and semicolons. ESLint uses the same TypeScript, React Hooks, and Fast Refresh rules, alongside strict TypeScript unused-variable checks.

- `src/Root.tsx`: React entry composition.
- `src/material-ui/App.tsx`: theme provider and application shell.
- `src/material-ui/themes/darkTheme.ts`: portfolio palette and component defaults.
- `src/material-ui/types/`: `background`, `border`, and `textColor` palette extensions.
- `src/material-ui/components/Controllers/`: hardware graphic and control/mapping editors.
- `src/material-ui/components/Workspace/`: workspace, settings, and import dialog.
- `src/constants/`: Mixxx action catalog and special key commands.
- `src/types/`: controller and project interfaces.
- `src/hooks/`: temporary project state and import/export orchestration.
- `src/utils/`: firmware parsing, MIDI conversion, file formats, and display-only geometry.
- `src/index.css`: hardware geometry, semantic glows, and responsive layout.

## Verification

```sh
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
# With pnpm dev running in another terminal:
pnpm exec playwright test
```

If using an existing browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Core tests cover firmware preservation, real Oryx import, note conversion, existing mappings, generated script semantics, unknown XML preservation, and ZIP restoration. Browser tests cover empty startup, legacy-autosave removal, memory-only editing, both device layouts, controller-only imports, download/reimport, source availability, privacy disclosures, request monitoring, and mobile overflow.

Format source with `pnpm format`; apply ESLint fixes with `pnpm lint:fix`.

References: [Moonlander hardware](https://www.zsa.io/moonlander), [Mixxx control reference](https://manual.mixxx.org/2.5/en/chapters/appendix/mixxx_controls), [QMK MIDI](https://docs.qmk.fm/features/midi), [QMK note implementation](https://github.com/qmk/qmk_firmware/blob/master/quantum/process_keycode/process_midi.c), [Mixxx MIDI scripting](https://github.com/mixxxdj/mixxx/wiki/midi-scripting), [Akai MIDImix customization](https://support.akaipro.com/en/support/solutions/articles/69000856691-akai-pro-midimix-using-the-editor-for-customisation).
