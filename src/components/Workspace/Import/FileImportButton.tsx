import { useRef } from 'react';
import { Button } from '@mui/material';
interface Props {
	label: string;
	accept: string;
	multiple?: boolean;
	disabled: boolean;
	onFiles: (files: File[]) => Promise<void>;
}
const FileImportButton = ({ label, accept, multiple, disabled, onFiles }: Props) => {
	const input = useRef<HTMLInputElement>(null);
	return (
		<>
			<Button variant="outlined" disabled={disabled} onClick={() => input.current?.click()}>
				{label}
			</Button>
			<input
				ref={input}
				type="file"
				accept={accept}
				multiple={multiple}
				hidden
				onChange={(event) => {
					const files = Array.from(event.target.files ?? []);
					event.target.value = '';
					if (files.length) void onFiles(files);
				}}
			/>
		</>
	);
};
export default FileImportButton;
