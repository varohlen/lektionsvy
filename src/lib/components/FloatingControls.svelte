<script lang="ts">
	type Theme = 'light' | 'dark';

	type Props = {
		theme: Theme;
		addMenuOpen: boolean;
		settingsOpen: boolean;
		fullscreenActive: boolean;
		onToggleAddMenu: () => void;
		onToggleSettings: () => void;
		onToggleFullscreen: () => void;
	};

	let {
		theme: _theme,
		addMenuOpen,
		settingsOpen,
		fullscreenActive,
		onToggleAddMenu,
		onToggleSettings,
		onToggleFullscreen
	}: Props = $props();
</script>

<div class="floating-controls">
	<button
		class:active={addMenuOpen}
		class="control-button"
		type="button"
		aria-label="Lägg till widget"
		onclick={onToggleAddMenu}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 5v14M5 12h14" />
		</svg>
	</button>

	<button
		class:active={settingsOpen}
		class="control-button"
		type="button"
		aria-label="Inställningar"
		onclick={onToggleSettings}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path
				d="M10.3 3.1h3.4l.5 2a7.4 7.4 0 0 1 1.5.6l1.8-1 2.4 2.4-1 1.8c.2.5.5 1 .6 1.5l2 .5v3.4l-2 .5a7.4 7.4 0 0 1-.6 1.5l1 1.8-2.4 2.4-1.8-1a7.4 7.4 0 0 1-1.5.6l-.5 2h-3.4l-.5-2a7.4 7.4 0 0 1-1.5-.6l-1.8 1-2.4-2.4 1-1.8a7.4 7.4 0 0 1-.6-1.5l-2-.5v-3.4l2-.5a7.4 7.4 0 0 1 .6-1.5l-1-1.8 2.4-2.4 1.8 1a7.4 7.4 0 0 1 1.5-.6z"
			/>
			<circle cx="12" cy="12" r="2.7" />
		</svg>
	</button>

	<button
		class:active={fullscreenActive}
		class="control-button"
		type="button"
		aria-label={fullscreenActive ? "Lämna helskärm" : "Visa i helskärm"}
		onclick={onToggleFullscreen}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			{#if fullscreenActive}
				<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
			{:else}
				<path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
				<path d="M8 8 4 4M16 8l4-4M8 16l-4 4M16 16l4 4" />
			{/if}
		</svg>
	</button>
</div>

<style>
	.floating-controls {
		position: fixed;
		top: 1.25rem;
		right: 1.25rem;
		z-index: 20;
		display: grid;
		gap: 0.7rem;
	}

	.control-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.1rem;
		height: 3.1rem;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface-soft);
		color: var(--text);
		box-shadow: var(--shadow);
		cursor: pointer;
		backdrop-filter: blur(18px);
	}

	.control-button.active {
		background: color-mix(in srgb, var(--pg-blue-500) 18%, var(--surface-soft));
	}

	.control-button svg {
		width: 1.15rem;
		height: 1.15rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
	}
</style>
