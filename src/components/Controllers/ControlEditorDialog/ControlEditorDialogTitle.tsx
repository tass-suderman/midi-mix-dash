import { Button, DialogTitle } from '@mui/material';
import { CloseRounded } from '@mui/icons-material';

interface Props {
	title: string;
	controlLabel: string;
	onClose: () => void;
}

const ControlEditorDialogTitle = ({ title, controlLabel, onClose }: Props) => {
	return (
		<DialogTitle display="flex" alignItems="center" justifyContent="space-between">
			<div className="eyebrow">
				<div>{title}</div>
				<div>{controlLabel}</div>
			</div>
			<div className="dialog-heading">
				<Button aria-label="Close editor" onClick={onClose}>
					<CloseRounded />
				</Button>
			</div>
		</DialogTitle>
	);
};

export default ControlEditorDialogTitle;
