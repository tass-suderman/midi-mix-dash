# MIDI Workbench

A local React + Material UI editor for a ZSA Moonlander MIDI layer and an Akai MIDImix, styled and organized to match `../tass-suderman-portfolio-react`. It uses the same navy backgrounds, lavender text, purple borders, flat Material UI surfaces, and rounded buttons.

```sh
pnpm install
pnpm dev
```

Open http://localhost:7457. `pnpm build` produces the static application in `dist/`; `pnpm preview` serves it.

## Editing

- The Moonlander view follows the 72-key `LAYOUT_moonlander` argument order. Click a key to assign a MIDI note, a special command, or an existing QMK macro. Layer 14 is managed; the other layers and tap-dance implementations are retained.
- The MIDImix view provides 24 knobs, 9 faders, and 19 buttons. Send All is shown as a hardware utility. Factory MIDI addresses are supplied; the address disclosure lets you match customized hardware. This app does not program the MIDImix itself.
- When all 72 imported layer-14 keys are transparent or disabled, **Fill empty layer with MIDI** assigns `MI_C` through `MI_B5` in firmware row order: left half, right half, then the next row. The startup octave/channel settings apply. It refuses to overwrite notes, special keys, or mappings. The relocated large thumb keys keep their firmware positions.
- **Clear current keys** disables all layer-14 keys (`KC_NO`) and removes Moonlander Mixxx mappings, including imported controller presets/scripts. Other firmware layers and MIDImix are preserved. **Undo layer change** restores the preceding clear/fill operation until another project edit or import occurs. You can clear a transparent/special layer and immediately fill it with ascending MIDI notes.
- Mapping colors: blue = MIDI note, red = Mixxx mapping, purple = both, white = special command. Deck-2 destinations use yellow instead of red and green instead of purple, including EQ and deck-assigned effects. Mapping labels and tooltips also convey the state.
- Select a Mixxx action and destination deck. Buttons support toggle, hold, a repeatable trigger pulse, or a fixed native control value. Knobs/faders use `engine.setParameter` with normalized incoming MIDI values. Custom group/control names are supported.
- Actions are grouped into transport, mixer/EQ, hotcues/loops, effects, samplers, master/headphones, and library/Auto DJ. Context fields select decks, hotcue numbers, loop lengths, effect units/slots/parameters, and samplers. Knobs/faders list only continuous actions; button-only actions and empty action groups are hidden. Incompatible imported actions must be removed or replaced before saving the control. Custom targets remain available for continuous controls supported by Mixxx.
- The Moonlander graphic mirrors both halves, leaves the inner row gaps, and places the larger keys above the thumb keys, with both thumb clusters rotated inward. Display geometry is separate from firmware order, including for existing saved projects.
- Save commits an individual control; Cancel discards its draft. The project exists only in the current tab’s memory. Refreshing or closing the tab clears it. Download a ZIP to save your work; there is no autosave.

## Import and export

The workspace starts with empty Moonlander and MIDImix graphics and never loads bundled examples or previous sessions. Selecting a placeholder control opens import; these display-only controls are not exported as a loaded project. Import your own source ZIP or Mixxx controller files. Either device can be used independently. Moonlander controller files imported without firmware appear as MIDI-address cards until a source ZIP supplies their physical key positions. The supplied repository files remain useful as explicit test fixtures, but they are not served with the application. Legacy Moonlander headphone mappings are translated to Mixxx’s deck `pfl` control.

Import an Oryx **source ZIP**, or select loose source files together using **Loose firmware files**. Include one `keymap.c`, `config.h`, and `rules.mk`. Compiled binaries cannot be edited. Layer 14 must use `LAYOUT_moonlander` with 72 arguments. The source ZIP's current layer is displayed as imported; it is not silently replaced by the example MIDI layout.

Import one Mixxx XML preset and its referenced JavaScript files together, choosing the destination device. The supplied legacy Moonlander callbacks and Workbench-generated scripts are understood. Other scripts are retained as opaque files, never executed in the browser; their behavior is not visually editable. Unmatched XML controls and outputs are preserved. For a complete editable round trip, import the exported Workbench ZIP.

Downloads contain:

- `firmware/midi_workbench/`: updated source. Copy into `keyboards/zsa/moonlander/keymaps/` in a compatible ZSA QMK checkout and compile for your hardware revision, for example `qmk compile -kb zsa/moonlander/reva -km midi_workbench`. Flash the resulting binary using your normal workflow.
- `prepare-firmware.sh` (when firmware is included): after extracting the ZIP, run `bash prepare-firmware.sh /path/to/zsa-qmk zsa/moonlander/reva --build`. Omit `--build` to only prepare the keymap. The script refuses an existing destination and never flashes automatically. Use your hardware target and a compatible, configured QMK checkout.
- `mixxx/`: presets and scripts. Copy the whole directory's contents into your Mixxx user controllers directory, restart Mixxx, select the Workbench presets, and enable both controllers.
- `midi-workbench.json`: editable project state.
- `README.txt`: installation instructions.

The exporter sets `MIDI_ENABLE = yes`, `MIDI_ADVANCED`, and startup octave/channel/transpose. The note calculation is `12 × octave offset + QMK note offset`; the UI displays scientific pitch notation, decimal, and hex. Runtime octave/channel/transpose commands can move notes away from the exported mappings. `MI_ON` / `MI_OFF` control basic QMK MIDI mode; advanced note keycodes send MIDI independently.

This is a static, browser-only application. It does not compile or flash firmware, write into Mixxx's directory, or require a server/account. Physical device behavior needs validation on your setup.

## License and privacy

The application uses GNU AGPL v3; see `LICENSE.md`. The Information tab links the license and the corresponding application source. Each build generates a static `source.zip` containing the current application and build files. This archive excludes local firmware/controller samples, imported projects, environment files, and Git metadata.

See [the privacy policy](PRIVACY.md). There are no application database calls, analytics integrations, upload endpoints, or persistent browser saves. The only local-storage operation removes the old `midi-workbench-v1` autosave. Downloads are the user's own files; browsers may still cache application assets.

Vercel's infrastructure records traffic/operational metadata even without Web Analytics. The policy explicitly distinguishes that hosting behavior from this application's treatment of project data. No Vercel account settings were changed. Keep Web Analytics, Speed Insights, injected tracking scripts, and integrations disabled if you want to preserve this application's privacy behavior. Deploy the static `dist/` output. Hosting security headers are configured by the deployment/platform; this repository does not configure Vercel logging. The production browser test verifies that editing/export still work under a `connect-src 'none'` policy. The development server's local HMR connection is not a project-data upload.

## Code conventions

The application follows the React portfolio's arrow-function components, typed props, default component exports, semantic Material UI palette keys, and `sx` styling for shared components. Formatting uses tabs, single quotes, and semicolons. ESLint uses the same TypeScript, React Hooks, and Fast Refresh rules, alongside strict TypeScript unused-variable checks.

- `src/Root.tsx`: React entry composition.
- `src/App.tsx`: theme provider and application shell.
- `src/themes/darkTheme.ts`: portfolio palette and component defaults.
- `src/types/`: `background`, `border`, and `textColor` palette extensions.
- `src/components/Controllers/`: hardware composition, shells, captions, and legend. `ControlEditorDialog/` contains key behavior, note, special-command, MIDI-address, title, and action units; `Mapping/` contains action selection, target fields, behavior, and preview units.
- `src/components/Workspace/`: workspace header/tabs/footer, device view, layer tools, settings, and export information. `Import/` contains reusable file inputs and separate firmware/controller forms.
- `src/components/Information/`: separate license and privacy sections.
- `src/components/Fields/`: shared numeric select field.
- `src/constants/`: Mixxx action catalog and special key commands.
- `src/types/`: controller and project interfaces.
- `src/hooks/`: temporary project state, import/export orchestration, workspace handlers, and reversible layer operations.
- `src/utils/`: firmware parsing, MIDI conversion, file formats, display-only geometry, immutable clear/fill operations, action filtering, and editor validation.
- `src/index.css`: hardware geometry, semantic glows, and responsive layout.

## Verification

```sh
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm exec playwright install chromium
pnpm exec playwright test
```

If using an existing browser, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Playwright starts the development server automatically. Core tests cover firmware preservation, real Oryx import, note conversion, existing mappings, generated script semantics, unknown XML preservation, and ZIP restoration. Browser tests cover empty startup, legacy-autosave removal, memory-only editing, both device layouts, controller-only imports, download/reimport, source availability, privacy disclosures, request monitoring, and mobile overflow.

Hardware compilation/flashing and live Mixxx behavior still need validation on your setup. Tests exercise the generated mappings and preparation script without a physical device.

Format source with `pnpm format`; apply ESLint fixes with `pnpm lint:fix`.

References: [Moonlander hardware](https://www.zsa.io/moonlander), [Mixxx control reference](https://manual.mixxx.org/2.5/en/chapters/appendix/mixxx_controls), [QMK MIDI](https://docs.qmk.fm/features/midi), [QMK note implementation](https://github.com/qmk/qmk_firmware/blob/master/quantum/process_keycode/process_midi.c), [Mixxx MIDI scripting](https://github.com/mixxxdj/mixxx/wiki/midi-scripting), [Akai MIDImix customization](https://support.akaipro.com/en/support/solutions/articles/69000856691-akai-pro-midimix-using-the-editor-for-customisation).

## Single-spa platform

`src/spa.tsx` exports `bootstrap`, `mount`, and `unmount`, accepting the platform's `domElement` custom prop. App styles are scoped to `.midi-mix-dash`; mount/unmount installs/removes its stylesheet and unmount discards the temporary project. The standalone page still uses `src/index.tsx`.

- Development import map: `"@tass-suderman/midi-mix-dash": "http://localhost:7457/src/spa.tsx"`.
- Register route `/midi-mix-dash` in the orchestrator's `microfrontends.ts` and add its module declaration.
- Run `pnpm build:spa` and serve the contents of `dist/` at `/midi-mix-dash/`. Production import map: `"@tass-suderman/midi-mix-dash": "/midi-mix-dash/spa.js"`.
- Publish the whole directory, including `assets/`, `source.zip`, and `LICENSE.md`. `pnpm build` instead builds for hosting at the origin root. For another deployment prefix, run `pnpm exec vite build --base=/your-prefix/` after `pnpm exec tsc -b`.

The downloaded source archive contains application/build source. The full repository also includes development tests and explicit test fixtures, which are not public assets or included in `source.zip`.
