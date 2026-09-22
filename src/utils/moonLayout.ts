// Display-only geometry. IDs and array order remain the QMK macro argument order.
export function moonKeyGeometry(index: number) {
	const rows = [7, 7, 7, 6, 6, 3];
	let start = 0;
	for (let row = 0; row < rows.length; row++) {
		const count = rows[row];
		if (index < start + count * 2) {
			const right = index >= start + count;
			const col = (index - start) % count;
			const outerCol = right ? count - 1 - col : col;
			const large = row === 4 && outerCol === 5;
			const thumb = large || row === 5;
			let left = 20 + outerCol * 62;
			let top = 36 + row * 66 + [17, 9, 0, 9, 18, 25, 25][outerCol];
			let width = 54,
				height = 54,
				rotate = 0;
			if (large) {
				left = 403;
				top = 285;
				width = 66;
				height = 85;
				rotate = 18;
			}
			if (row === 5) {
				left = 310 + outerCol * 57;
				top = 388 + outerCol * 20;
				width = 49;
				height = 74;
				rotate = 18;
			}
			return {
				left: right ? 1040 - left - width : left,
				top,
				width,
				height,
				rotate: right ? -rotate : rotate,
				large,
				thumb,
			};
		}
		start += count * 2;
	}
	throw new Error('Invalid Moonlander key index');
}
