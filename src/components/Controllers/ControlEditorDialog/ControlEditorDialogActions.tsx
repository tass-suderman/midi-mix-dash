import { Button, DialogActions } from '@mui/material';
interface Props {
	valid: boolean;
	onClose: () => void;
	onSave: () => void;
}
const ControlEditorDialogActions = ({ valid, onClose, onSave }: Props) => (
	<DialogActions>
		<Button onClick={onClose} color="inherit">
			Cancel
		</Button>
		<Button variant="contained" disabled={!valid} onClick={onSave}>
			Save mapping
		</Button>
	</DialogActions>
);
export default ControlEditorDialogActions;
