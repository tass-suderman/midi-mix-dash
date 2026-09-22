#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 || ( $# -eq 3 && "$3" != "--build" ) ]]; then
  echo "Usage: bash prepare-firmware.sh /path/to/zsa-qmk zsa/moonlander/reva [--build]" >&2
  exit 1
fi
qmk_checkout="$1"
keyboard_target="$2"
case "$keyboard_target" in
  zsa/moonlander|zsa/moonlander/reva|zsa/moonlander/revb) ;;
  *) echo "Choose a Moonlander target supported by your ZSA QMK checkout." >&2; exit 1 ;;
esac
script_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
keymaps_dir="$qmk_checkout/keyboards/zsa/moonlander/keymaps"
destination="$keymaps_dir/midi_workbench"
[[ -d "$keymaps_dir" ]] || { echo "Moonlander keymaps directory not found in the checkout." >&2; exit 1; }
[[ -f "$script_dir/firmware/midi_workbench/keymap.c" ]] || { echo "Extract the entire export ZIP first." >&2; exit 1; }
[[ ! -e "$destination" ]] || { echo "Destination already exists: $destination. Move it aside before retrying." >&2; exit 1; }
if [[ "${3:-}" == "--build" ]]; then
  command -v qmk >/dev/null || { echo "Install and configure the QMK CLI before building." >&2; exit 1; }
fi
mkdir -- "$destination"
cp -R -- "$script_dir/firmware/midi_workbench/." "$destination/"
echo "Prepared $destination"
if [[ "${3:-}" == "--build" ]]; then
  cd -- "$qmk_checkout"
  qmk compile -kb "$keyboard_target" -km midi_workbench
else
  echo "Compile from your checkout with: qmk compile -kb $keyboard_target -km midi_workbench"
fi
echo "Flash the resulting binary with Keymapp or your usual flasher. This script does not flash hardware."
