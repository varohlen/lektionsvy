<script lang="ts">
	import WidgetShell from './WidgetShell.svelte';

	type LessonStep = {
		label: string;
		value: string;
	};

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		z: number;
		selected: boolean;
		steps: LessonStep[];
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
	};

	let { x, y, w, h, z, selected, steps, onSelect, onMoveStart, onResizeStart, onBringForward, onSendBackward, onDelete }: Props = $props();
</script>

<WidgetShell
	title="Lektion"
	{x}
	{y}
	{w}
	{h}
	{z}
	{selected}
	{onSelect}
	{onMoveStart}
	{onResizeStart}
	{onBringForward}
	{onSendBackward}
	{onDelete}
>
	<div class="lesson-list">
		{#each steps as step}
			<div class="lesson-row">
				<p>{step.label}</p>
				<strong>{step.value}</strong>
			</div>
		{/each}
	</div>
</WidgetShell>

<style>
	.lesson-list {
		display: grid;
		gap: 0.75rem;
	}

	.lesson-row {
		display: grid;
		gap: 0.3rem;
		padding: 0.9rem 1rem;
		border-radius: 1rem;
		background: var(--surface-soft);
	}

	.lesson-row p,
	.lesson-row strong {
		margin: 0;
	}

	.lesson-row p {
		font-size: 0.8rem;
		color: color-mix(in srgb, var(--text) 60%, transparent);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.lesson-row strong {
		font-size: 1rem;
		line-height: 1.4;
	}
</style>
