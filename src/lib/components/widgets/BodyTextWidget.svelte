<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { TextStyle } from '@tiptap/extension-text-style';
	import FontSize from '@tiptap/extension-font-size';
	import WidgetShell from './WidgetShell.svelte';

	type Props = {
		x: number;
		y: number;
		w: number;
		h: number;
		z: number;
		selected: boolean;
		value: string;
		onSelect: () => void;
		onMoveStart: (event: PointerEvent) => void;
		onResizeStart: (event: PointerEvent) => void;
		onBringForward: () => void;
		onSendBackward: () => void;
		onDelete?: () => void;
		onValueChange: (value: string) => void;
	};

	let {
		x,
		y,
		w,
		h,
		z,
		selected,
		value,
		onSelect,
		onMoveStart,
		onResizeStart,
		onBringForward,
		onSendBackward,
		onDelete,
		onValueChange
	}: Props = $props();

	let editorElement = $state<HTMLDivElement | null>(null);
	let editor = $state<Editor | null>(null);
	let isBold = $state(false);
	let isItalic = $state(false);
	let isBulletList = $state(false);
	let isOrderedList = $state(false);
	let currentFontSize = $state('16px');

	const fontSizes = ['12px', '14px', '16px', '20px', '24px', '32px'];

	onMount(() => {
		if (!editorElement) return;

		editor = new Editor({
			element: editorElement,
			extensions: [
				StarterKit,
				TextStyle,
				FontSize,
			],
			content: value || '',
			onUpdate: ({ editor: ed }) => {
				onValueChange(ed.getHTML());
			},
			onSelectionUpdate: ({ editor: ed }) => {
				updateToolbarState(ed);
			},
			onTransaction: ({ editor: ed }) => {
				updateToolbarState(ed);
			},
		});
	});

	function updateToolbarState(ed: Editor) {
		isBold = ed.isActive('bold');
		isItalic = ed.isActive('italic');
		isBulletList = ed.isActive('bulletList');
		isOrderedList = ed.isActive('orderedList');
		const size = ed.getAttributes('textStyle')?.fontSize;
		currentFontSize = size || '16px';
	}

	onDestroy(() => {
		editor?.destroy();
	});

	$effect(() => {
		if (!editor) return;
		if (editor.isFocused) return;
		const current = editor.getHTML();
		if (current !== value) {
			editor.commands.setContent(value || '', false);
		}
	});

	function toggleBold() {
		editor?.chain().focus().toggleBold().run();
	}

	function toggleItalic() {
		editor?.chain().focus().toggleItalic().run();
	}

	function toggleBulletList() {
		editor?.chain().focus().toggleBulletList().run();
	}

	function toggleOrderedList() {
		editor?.chain().focus().toggleOrderedList().run();
	}

	function setFontSize(event: Event) {
		const size = (event.target as HTMLSelectElement).value;
		if (size === '16px') {
			editor?.chain().focus().unsetFontSize().run();
		} else {
			editor?.chain().focus().setFontSize(size).run();
		}
	}
</script>

<WidgetShell
	title="Brödtext"
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
	<div class="body-text-container">
		{#if selected && editor}
			<div class="formatting-toolbar">
				<button
					class="fmt-btn"
					class:active={isBold}
					onclick={toggleBold}
					title="Fetstil (Cmd+B)"
				>
					<strong>B</strong>
				</button>
				<button
					class="fmt-btn"
					class:active={isItalic}
					onclick={toggleItalic}
					title="Kursiv (Cmd+I)"
				>
					<em>I</em>
				</button>
				<span class="fmt-divider"></span>
				<button
					class="fmt-btn"
					class:active={isBulletList}
					onclick={toggleBulletList}
					title="Punktlista"
				>
					<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
						<circle cx="2.5" cy="3.5" r="1.5"/>
						<circle cx="2.5" cy="8" r="1.5"/>
						<circle cx="2.5" cy="12.5" r="1.5"/>
						<rect x="6" y="2.5" width="9" height="2" rx="0.5"/>
						<rect x="6" y="7" width="9" height="2" rx="0.5"/>
						<rect x="6" y="11.5" width="9" height="2" rx="0.5"/>
					</svg>
				</button>
				<button
					class="fmt-btn"
					class:active={isOrderedList}
					onclick={toggleOrderedList}
					title="Numrerad lista"
				>
					<svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
						<text x="0.5" y="5" font-size="5" font-weight="600">1.</text>
						<text x="0.5" y="9.5" font-size="5" font-weight="600">2.</text>
						<text x="0.5" y="14" font-size="5" font-weight="600">3.</text>
						<rect x="6" y="2.5" width="9" height="2" rx="0.5"/>
						<rect x="6" y="7" width="9" height="2" rx="0.5"/>
						<rect x="6" y="11.5" width="9" height="2" rx="0.5"/>
					</svg>
				</button>
				<span class="fmt-divider"></span>
				<select
					class="fmt-select"
					value={currentFontSize}
					onchange={setFontSize}
					title="Textstorlek"
				>
					{#each fontSizes as size}
						<option value={size}>{parseInt(size)}px</option>
					{/each}
				</select>
			</div>
		{/if}
		<div class="body-text-wrap">
			<div
				bind:this={editorElement}
				class="body-text-editor"
			>
			</div>
		</div>
	</div>
</WidgetShell>

<style>
	.body-text-container {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
	}

	.formatting-toolbar {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		padding: 0.25rem 0.35rem;
		border-bottom: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
		flex-shrink: 0;
	}

	.fmt-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 1.65rem;
		height: 1.65rem;
		border: none;
		border-radius: 0.3rem;
		background: transparent;
		color: var(--text);
		cursor: pointer;
		font-size: 0.8rem;
		transition: background 0.12s;
	}

	.fmt-btn:hover {
		background: color-mix(in srgb, var(--text) 10%, transparent);
	}

	.fmt-btn.active {
		background: color-mix(in srgb, var(--pg-blue-700) 20%, transparent);
		color: var(--pg-blue-700);
	}

	.fmt-divider {
		width: 1px;
		height: 1.1rem;
		background: color-mix(in srgb, var(--text) 15%, transparent);
		margin: 0 0.15rem;
	}

	.fmt-select {
		height: 1.65rem;
		border: 1px solid color-mix(in srgb, var(--text) 15%, transparent);
		border-radius: 0.3rem;
		background: transparent;
		color: var(--text);
		font-size: 0.7rem;
		padding: 0 0.3rem;
		cursor: pointer;
	}

	.body-text-wrap {
		flex: 1;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.body-text-editor {
		width: 100%;
		min-height: 100%;
		box-sizing: border-box;
	}

	.body-text-editor :global(.tiptap) {
		padding: 0.35rem 0.4rem;
		outline: none;
		font-family: "Myriad Pro", "Avenir Next", "Segoe UI", sans-serif;
		font-size: 1rem;
		font-weight: 400;
		line-height: 1.55;
		color: var(--text);
		min-height: 100%;
		user-select: text;
		cursor: text;
	}

	.body-text-editor :global(.tiptap p.is-editor-empty:first-child::before) {
		content: "Skriv instruktioner här...";
		color: color-mix(in srgb, var(--text) 32%, transparent);
		pointer-events: none;
		float: left;
		height: 0;
	}

	.body-text-editor :global(.tiptap p) {
		margin: 0 0 0.3rem;
	}

	.body-text-editor :global(.tiptap ul),
	.body-text-editor :global(.tiptap ol) {
		margin: 0.3rem 0;
		padding-left: 1.4rem;
	}

	.body-text-editor :global(.tiptap li) {
		margin-bottom: 0.15rem;
	}

	.body-text-editor :global(.tiptap strong) {
		font-weight: 700;
	}

	.body-text-editor :global(.tiptap em) {
		font-style: italic;
	}
</style>
