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

<div class="dock">
	<button
		class:active={addMenuOpen}
		class="dock-button"
		type="button"
		aria-label="Lägg till widget"
		onclick={onToggleAddMenu}
	>
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 5v14M5 12h14" />
		</svg>
		<span class="dock-label">Widgets</span>
	</button>

	<span class="dock-divider"></span>

	<button
		class:active={settingsOpen}
		class="dock-button"
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
		<span class="dock-label">Inställningar</span>
	</button>

	<span class="dock-divider"></span>

	<button
		class:active={fullscreenActive}
		class="dock-button"
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
		<span class="dock-label">{fullscreenActive ? "Avsluta" : "Helskärm"}</span>
	</button>
</div>

<style>
	.dock {
		position: fixed;
		bottom: 1rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 20;
		display: flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.45rem 0.6rem;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.dock-divider {
		width: 1px;
		height: 1.6rem;
		background: var(--border);
		margin: 0 0.15rem;
	}

	.dock-button {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.5rem 0.75rem;
		border: 1px solid transparent;
		border-radius: 0.55rem;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.82rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease, color 120ms ease, border-color 120ms ease;
	}

	.dock-button:hover {
		background: color-mix(in srgb, var(--text) 5%, transparent);
		color: var(--text);
	}

	.dock-button.active {
		background: color-mix(in srgb, var(--pg-blue-500) 12%, var(--surface-soft));
		border-color: color-mix(in srgb, var(--pg-blue-500) 22%, transparent);
		color: var(--text);
	}

	.dock-button svg {
		width: 1.1rem;
		height: 1.1rem;
		fill: none;
		stroke: currentColor;
		stroke-linecap: round;
		stroke-linejoin: round;
		stroke-width: 1.8;
		flex-shrink: 0;
	}

	.dock-label {
		line-height: 1;
	}
</style>
