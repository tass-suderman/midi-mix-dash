import FileImportButton from './FileImportButton';
interface Props {
	busy: boolean;
	uploadFirmware: (file: File) => Promise<void>;
	uploadLooseFirmware: (files: File[]) => Promise<void>;
}
const FirmwareImportFields = ({ busy, uploadFirmware, uploadLooseFirmware }: Props) => (
	<>
		<FileImportButton
			label="Firmware / project ZIP"
			accept=".zip"
			disabled={busy}
			onFiles={(files) => uploadFirmware(files[0])}
		/>
		<FileImportButton
			label="Loose firmware files"
			accept=".c,.h,.mk,.json,.md,.txt"
			multiple
			disabled={busy}
			onFiles={uploadLooseFirmware}
		/>
		<p className="muted">
			Select keymap.c, config.h, and rules.mk together; include keymap.json and supporting source
			files if present.
		</p>
	</>
);
export default FirmwareImportFields;
