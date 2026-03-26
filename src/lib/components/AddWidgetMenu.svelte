<script lang="ts">
	type Entry = {
		key: string;
		label: string;
		count: number;
		status: "ready" | "beta" | "prototype";
		note?: string;
		onAdd: () => void;
	};

	type Props = {
		open: boolean;
		entries: Entry[];
	};

	let { open, entries }: Props = $props();
	let experimentalOpen = $state(false);

	const primaryEntries = $derived(
		entries.filter((entry) => entry.status !== "prototype"),
	);
	const prototypeEntries = $derived(
		entries.filter((entry) => entry.status === "prototype"),
	);
</script>

{#if open}
	<div class="panel add-panel">
		<p class="panel-title">Widgets</p>

		{#if primaryEntries.length > 0}
			<div class="entry-section">
				<div class="entry-list">
					{#each primaryEntries as entry}
						<div class="entry-button">
							<span class="entry-copy">
								<span class="entry-header">
									<span>{entry.label}</span>
									{#if entry.status === "beta"}
										<span class="entry-badge entry-badge--beta">Beta</span>
									{/if}
								</span>
								{#if entry.note}
									<span class="entry-note">{entry.note}</span>
								{/if}
							</span>
							<span class="entry-actions">
								{#if entry.count > 0}
									<span class="entry-count">{entry.count} st</span>
								{/if}
								<button class="entry-add" type="button" aria-label={`Lägg till ${entry.label}`} onclick={entry.onAdd}>
									+
								</button>
							</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if prototypeEntries.length > 0}
			<div class="entry-section">
				<button
					class="section-toggle"
					type="button"
					aria-expanded={experimentalOpen}
					onclick={() => (experimentalOpen = !experimentalOpen)}
				>
					<span>Prototyper</span>
					<span class:section-toggle__chevron--open={experimentalOpen} class="section-toggle__chevron">
						⌄
					</span>
				</button>

				{#if experimentalOpen}
					<div class="entry-list">
						{#each prototypeEntries as entry}
							<div class="entry-button">
								<span class="entry-copy">
									<span class="entry-header">
										<span>{entry.label}</span>
										<span class="entry-badge entry-badge--prototype">Prototyp</span>
									</span>
									{#if entry.note}
										<span class="entry-note">{entry.note}</span>
									{/if}
								</span>
								<span class="entry-actions">
									{#if entry.count > 0}
										<span class="entry-count">{entry.count} st</span>
									{/if}
									<button class="entry-add" type="button" aria-label={`Lägg till ${entry.label}`} onclick={entry.onAdd}>
										+
									</button>
								</span>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</div>
{/if}

<style>
	.panel {
		position: fixed;
		top: 1.25rem;
		right: 5rem;
		z-index: 19;
		width: 16rem;
		padding: 1rem;
		border: 1px solid var(--border);
		border-radius: 1.35rem;
		background: var(--surface);
		backdrop-filter: blur(22px);
		box-shadow: var(--shadow);
	}

	.panel-title {
		margin: 0 0 0.8rem;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}

	.entry-list {
		display: grid;
		gap: 0.55rem;
	}

	.entry-section + .entry-section {
		margin-top: 1rem;
	}

	.section-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.2rem 0;
		border: 0;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.74rem;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		cursor: pointer;
	}

	.section-toggle__chevron {
		font-size: 1rem;
		line-height: 1;
		transition: transform 140ms ease;
	}

	.section-toggle__chevron--open {
		transform: rotate(180deg);
	}

	.entry-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface-soft);
	}

	.entry-copy {
		display: grid;
		gap: 0.16rem;
		text-align: left;
	}

	.entry-header {
		display: flex;
		align-items: center;
		gap: 0.45rem;
	}

	.entry-badge {
		padding: 0.12rem 0.4rem;
		border-radius: 999px;
		font-size: 0.64rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.entry-badge--beta {
		background: color-mix(in srgb, var(--pg-orange-500) 20%, transparent);
		color: var(--pg-orange-700);
	}

	.entry-badge--prototype {
		background: color-mix(in srgb, var(--pg-blue-500) 18%, transparent);
		color: var(--pg-blue-700);
	}

	.entry-note {
		font-size: 0.74rem;
		color: var(--muted);
	}

	.entry-actions {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.entry-count {
		padding: 0.32rem 0.62rem;
		border: 1px solid var(--border);
		border-radius: 999px;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--muted);
		background: var(--surface);
	}

	.entry-add {
		width: 2rem;
		height: 2rem;
		padding: 0;
		border: 1px solid var(--border);
		border-radius: 999px;
		background: var(--surface);
		color: var(--text);
		font-size: 1.2rem;
		font-weight: 700;
		line-height: 1;
		cursor: pointer;
	}

</style>
