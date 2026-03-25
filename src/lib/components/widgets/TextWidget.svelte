<script lang="ts">
	import IntrinsicTextWidgetBase from './IntrinsicTextWidgetBase.svelte';

	type TextFont = 'myriad' | 'knewave';

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		scaleHeight: number;
		z: number;
		selected: boolean;
		value: string;
		font: TextFont;
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
		onMeasure: (size: { width: number; height: number }) => void;
		onToggleFont: () => void;
		onValueChange: (value: string) => void;
	};

	let {
		x,
		y,
		w,
		h,
		scaleHeight,
		z,
		selected,
		value,
		font,
		onSelect,
		onMoveStart,
		onResizeStart,
		onBringForward,
		onSendBackward,
		onDelete,
		onMeasure,
		onToggleFont,
		onValueChange
	}: Props = $props();

	const textFontFamily = $derived(
		font === 'knewave'
			? '"Knewave", "Brush Script MT", "Segoe Print", cursive'
			: '"Myriad Pro", "Avenir Next", "Segoe UI", sans-serif'
	);
	const lineHeight = $derived(font === 'knewave' ? '1.02' : '0.92');
	const letterSpacing = $derived(font === 'knewave' ? '-0.01em' : '-0.035em');
	const fontWeight = $derived(font === 'knewave' ? 400 : 700);

	function handleBlur(nextValue: string, element: HTMLDivElement) {
		if (!nextValue) {
			element.textContent = 'Skriv rubrik';
			onValueChange('Skriv rubrik');
			return;
		}

		onValueChange(nextValue);
	}
</script>

<IntrinsicTextWidgetBase
	title="Text"
	{x}
	{y}
	{w}
	{h}
	{scaleHeight}
	{z}
	{selected}
	value={value}
	fontFamily={textFontFamily}
	fontWeight={fontWeight}
	{lineHeight}
	{letterSpacing}
	editable={true}
	multiline={true}
	ariaLabel="Redigera rubrik"
	className={font === 'knewave' ? 'knewave' : ''}
	onMeasure={onMeasure}
	onInput={onValueChange}
	{onSelect}
	{onMoveStart}
	{onResizeStart}
	{onBringForward}
	{onSendBackward}
	{onDelete}
	onBlur={handleBlur}
>
	{#snippet toolbarActions()}
		<button
			class:alt-font={font === 'knewave'}
			class="toolbar-button text-style-button"
			type="button"
			aria-label={`Byt typsnitt för textwidgeten. Nuvarande typsnitt är ${
				font === 'knewave' ? 'Knewave' : 'Myriad Pro'
			}.`}
			title={font === 'knewave' ? 'Knewave' : 'Myriad Pro'}
			onclick={onToggleFont}
		>
			<span aria-hidden="true">T</span>
		</button>
	{/snippet}
</IntrinsicTextWidgetBase>

<style>
	.text-style-button.alt-font {
		font-family: "Knewave", "Brush Script MT", "Segoe Print", cursive;
		font-size: 0.95rem;
	}
</style>
