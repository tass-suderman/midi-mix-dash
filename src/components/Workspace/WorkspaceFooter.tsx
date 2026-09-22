interface Props {
	name: string;
}
const WorkspaceFooter = ({ name }: Props) => (
	<footer>
		<span>
			MIDI WORKBENCH <span className="footer-dot">/</span> {name}
		</span>
		<span>Designed around your setup.</span>
	</footer>
);
export default WorkspaceFooter;
