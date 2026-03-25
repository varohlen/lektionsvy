<script lang="ts">
	import WidgetShell from './WidgetShell.svelte';

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		z: number;
		selected: boolean;
		hourAngle: number;
		minuteAngle: number;
		secondAngle: number;
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
	};

	let {
		x,
		y,
		w,
		h,
		z,
		selected,
		hourAngle,
		minuteAngle,
		secondAngle,
		onSelect,
		onMoveStart,
		onResizeStart,
		onBringForward,
		onSendBackward,
		onDelete
	}: Props = $props();

	const clockSize = $derived(`${Math.max(8, Math.min(w - 16, h - 44))}px`);
</script>

<WidgetShell
	title="Analog"
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
	<div class="analog-clock" aria-label="Analog klocka" style={`width:${clockSize};`}>
		<div class="clock-center"></div>
		<div class="clock-hand hour-hand" style={`transform: rotate(${hourAngle}deg);`}></div>
		<div class="clock-hand minute-hand" style={`transform: rotate(${minuteAngle}deg);`}></div>
		<div class="clock-hand second-hand" style={`transform: rotate(${secondAngle}deg);`}></div>

		{#each Array.from({ length: 12 }) as _, index}
			<div
				class:tick-major={(index + 1) % 3 === 0}
				class="clock-tick"
				style={`transform: rotate(${index * 30}deg) translateY(-710%);`}
			></div>
		{/each}
	</div>
</WidgetShell>

<style>
	.analog-clock {
		position: relative;
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		margin: auto;
		border-radius: 999px;
		background: var(--surface-soft);
		border: 0.75rem solid rgba(111, 176, 200, 0.22);
	}

	.clock-center {
		position: absolute;
		width: 5%;
		height: 5%;
		border-radius: 999px;
		background: var(--text);
		z-index: 3;
	}

	.clock-hand {
		position: absolute;
		bottom: 50%;
		transform-origin: bottom center;
		border-radius: 999px;
	}

	.hour-hand {
		width: 2.8%;
		height: 24%;
		background: var(--text);
	}

	.minute-hand {
		width: 1.8%;
		height: 35%;
		background: var(--pg-blue-700);
	}

	.second-hand {
		width: 1%;
		height: 40%;
		background: var(--pg-red-700);
	}

	.clock-tick {
		position: absolute;
		width: 1%;
		height: 5%;
		border-radius: 999px;
		background: color-mix(in srgb, var(--text) 22%, transparent);
		transform-origin: center 710%;
	}

	.tick-major {
		height: 7%;
		background: color-mix(in srgb, var(--text) 44%, transparent);
	}
</style>
