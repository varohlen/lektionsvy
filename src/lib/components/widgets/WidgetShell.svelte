<script lang="ts">
	import { onMount } from 'svelte';

	type Props = {
		title: string;
		x: number;
		y: number;
		w: number;
		h: number;
		z: number;
		chrome?: boolean;
		fitContentWidth?: boolean;
		selected?: boolean;
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
		toolbarActions?: import('svelte').Snippet;
		children: import('svelte').Snippet;
	};

	let {
		title,
		x,
		y,
		w,
		h,
		z,
		chrome = true,
		fitContentWidth = false,
		selected = false,
		onSelect,
		onMoveStart,
		onResizeStart,
		onBringForward,
		onSendBackward,
		onDelete,
		toolbarActions,
		children
	}: Props = $props();

	let toolbarElement = $state<HTMLDivElement | null>(null);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let toolbarHorizontal = $state<'left' | 'right'>('right');
	let toolbarVertical = $state<'top' | 'bottom'>('bottom');

	function syncViewport() {
		if (typeof window === 'undefined') return;
		viewportWidth = window.innerWidth;
		viewportHeight = window.innerHeight;
	}

	function handlePointerDown(event: PointerEvent) {
		event.stopPropagation();
		onSelect();

		const target = event.target as HTMLElement;
		if (!selected) return;
		if (target.closest('button')) return;
		if (target.closest('input, textarea, select, a')) return;
		if (target.closest('[contenteditable="true"]')) return;

		event.preventDefault();
		onMoveStart(event);
	}

	function handleResizePointerDown(event: PointerEvent) {
		event.stopPropagation();
		event.preventDefault();
		onSelect();
		onResizeStart(event);
	}

	function handleSendBackward(event: MouseEvent) {
		event.stopPropagation();
		onSendBackward();
	}

	function handleBringForward(event: MouseEvent) {
		event.stopPropagation();
		onBringForward();
	}

	function handleDelete(event: MouseEvent) {
		event.stopPropagation();
		onDelete?.();
	}

	onMount(() => {
		syncViewport();
		window.addEventListener('resize', syncViewport);

		return () => window.removeEventListener('resize', syncViewport);
	});

	$effect(() => {
		if (!selected) return;
		if (!toolbarElement) return;

		const toolbarHeight = toolbarElement.offsetHeight;
		const edgePadding = 16;
		const outsideRight = x + w > viewportWidth - edgePadding;
		const outsideBottom = y + h + toolbarHeight + edgePadding > viewportHeight;

		toolbarHorizontal = outsideRight ? 'left' : 'right';
		toolbarVertical = outsideBottom ? 'top' : 'bottom';
	});
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	class:frameless={!chrome}
	class:selected
	class="widget"
	style={`${
		fitContentWidth ? "" : `width:${w}px;`
	}height:${h}px;left:${x}px;top:${y}px;z-index:${z};`}
	onpointerdown={handlePointerDown}
>
	<div class="widget-body">
		{@render children()}
	</div>

	{#if selected}
		<div
			bind:this={toolbarElement}
			class:top={toolbarVertical === 'top'}
			class:left={toolbarHorizontal === 'left'}
			class="widget-toolbar"
		>
			<span class="widget-title">{title}</span>
			<div class="widget-actions">
				{#if toolbarActions}
					{@render toolbarActions()}
				{/if}
				<button
					class="toolbar-button"
					type="button"
					aria-label={`Flytta ${title} bakåt`}
					onclick={handleSendBackward}
				>
					<span aria-hidden="true">↓</span>
				</button>
				<button
					class="toolbar-button"
					type="button"
					aria-label={`Flytta ${title} framåt`}
					onclick={handleBringForward}
				>
					<span aria-hidden="true">↑</span>
				</button>
				<button
					aria-label={`Ta bort ${title}`}
					class="toolbar-button delete-button"
					type="button"
					onclick={handleDelete}
				>
					<span aria-hidden="true" class="trash-icon">
						<svg viewBox="0 0 24 24" focusable="false">
							<path
								d="M9 3.75h6a1 1 0 0 1 1 1V6h3a.75.75 0 0 1 0 1.5h-1.02l-.76 11.05a2.25 2.25 0 0 1-2.25 2.1H8.03a2.25 2.25 0 0 1-2.25-2.1L5.02 7.5H4a.75.75 0 0 1 0-1.5h3V4.75a1 1 0 0 1 1-1Zm6 2.25V5.25h-6V6h6Zm-7.72 1.5.74 10.95a.75.75 0 0 0 .75.7h6.46a.75.75 0 0 0 .75-.7l.74-10.95H7.28Zm2.97 2.25a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V10.5a.75.75 0 0 1 .75-.75Zm3.5 0a.75.75 0 0 1 .75.75v5.25a.75.75 0 0 1-1.5 0V10.5a.75.75 0 0 1 .75-.75Z"
							></path>
						</svg>
					</span>
				</button>
				<button
					class="toolbar-button resize-button"
					type="button"
					aria-label={`Ändra storlek på ${title}`}
					onpointerdown={handleResizePointerDown}
				>
					<span aria-hidden="true">⤡</span>
				</button>
			</div>
		</div>
	{/if}
</div>

<style>
	.widget {
		position: absolute;
		display: grid;
		align-content: start;
		gap: 1rem;
		padding: 1rem;
		box-sizing: border-box;
		border: 1px solid var(--border);
		border-radius: 1.5rem;
		background: var(--surface);
		backdrop-filter: blur(24px);
		box-shadow: var(--shadow);
		overflow: visible;
		cursor: default;
		user-select: none;
		touch-action: none;
	}

	.widget.selected {
		box-shadow:
			0 0 0 2px color-mix(in srgb, var(--pg-blue-500) 68%, transparent),
			var(--shadow);
	}

	.widget.frameless {
		gap: 0.35rem;
		padding: 0;
		border: none;
		border-radius: 0;
		background: transparent;
		backdrop-filter: none;
		box-shadow: none;
		overflow: visible;
	}

	.widget.frameless.selected {
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--pg-blue-500) 68%, transparent);
		border-radius: 0.9rem;
	}

	.widget-toolbar {
		position: absolute;
		right: 0;
		bottom: -3.2rem;
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		padding: 0.42rem 0.72rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface-soft);
		color: var(--text);
		box-shadow: var(--shadow);
		white-space: nowrap;
		backdrop-filter: blur(18px);
	}

	.widget-toolbar.top {
		top: -3.2rem;
		bottom: auto;
	}

	.widget-toolbar.left {
		left: 0;
		right: auto;
	}

	.widget-title {
		font: inherit;
		font-size: 0.85rem;
		font-weight: 700;
	}

	.widget-actions {
		display: inline-flex;
		gap: 0.2rem;
	}

	.toolbar-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1.9rem;
		height: 1.9rem;
		padding: 0;
		border: none;
		border-radius: 999px;
		background: color-mix(in srgb, var(--surface-soft) 78%, transparent);
		color: var(--text);
		cursor: pointer;
		font-size: 1.05rem;
		font-weight: 800;
		line-height: 1;
	}

	.widget-body {
		min-height: 0;
		height: 100%;
		overflow: hidden;
		border-radius: inherit;
	}

	.resize-button {
		cursor: nwse-resize;
	}

	.delete-button {
		padding: 0;
	}

	.trash-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 1rem;
		height: 1rem;
	}

	.trash-icon svg {
		width: 100%;
		height: 100%;
		fill: currentColor;
	}
</style>
