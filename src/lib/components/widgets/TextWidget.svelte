<script lang="ts">
	import IntrinsicTextWidgetBase from './IntrinsicTextWidgetBase.svelte';
	import type { TextWidgetFontVariant } from '$lib/theme';

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		scaleHeight: number;
		z: number;
		selected: boolean;
		value: string;
		font: TextWidgetFontVariant;
		fontLabels: Record<TextWidgetFontVariant, string>;
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
		fontLabels,
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
		font === 'display' ? 'var(--font-display)' : 'var(--font-body)'
	);
	const lineHeight = $derived(font === 'display' ? '1.02' : '0.92');
	const letterSpacing = $derived(font === 'display' ? '-0.01em' : '-0.035em');
	const fontWeight = $derived(font === 'display' ? 400 : 700);
	const currentFontLabel = $derived(fontLabels[font]);

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
	className={font === 'display' ? 'display-font' : ''}
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
			class:alt-font={font === 'display'}
			class="toolbar-button text-style-button"
			type="button"
			aria-label={`Byt typsnitt för textwidgeten. Nuvarande stil är ${currentFontLabel}.`}
			title={currentFontLabel}
			onclick={onToggleFont}
		>
			<span aria-hidden="true">T</span>
		</button>
	{/snippet}
</IntrinsicTextWidgetBase>

<style>
	.text-style-button.alt-font {
		font-family: var(--font-display);
		font-size: 0.95rem;
	}
</style>
