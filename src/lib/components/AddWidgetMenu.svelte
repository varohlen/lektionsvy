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

	const categoryMap: Record<string, string> = {
		digital: "Tid",
		lcd: "Tid",
		analog: "Tid",
		date: "Tid",
		timer: "Timer",
		lessonTimer: "Timer",
		text: "Text",
		bodyText: "Text",
		stopwatch: "Timer",
		qrcode: "Övrigt",
		trelson: "Övrigt",
		logo: "Övrigt",
	};

	const categoryOrder = ["Tid", "Timer", "Text", "Övrigt"];

	type Category = { name: string; entries: Entry[] };

	const readyEntries = $derived(
		entries.filter((e) => e.status !== "prototype"),
	);
	const prototypeEntries = $derived(
		entries.filter((e) => e.status === "prototype"),
	);

	const categories = $derived<Category[]>(
		categoryOrder
			.map((name) => ({
				name,
				entries: readyEntries.filter((e) => categoryMap[e.key] === name),
			}))
			.filter((c) => c.entries.length > 0),
	);
</script>

{#if open}
	<div class="panel">
		<div class="panel-header">
			<p class="panel-title">Widgets</p>
		</div>

		<div class="category-grid">
			{#each categories as category}
				<div class="category">
					<p class="category-label">{category.name}</p>
					<div class="entry-list">
						{#each category.entries as entry}
							<button class="entry-card" type="button" onclick={entry.onAdd} aria-label={`Lägg till ${entry.label}`}>
								<span class="entry-name">
									{entry.label}
									{#if entry.status === "beta"}
										<span class="entry-badge entry-badge--beta">Beta</span>
									{/if}
								</span>
								{#if entry.count > 0}
									<span class="entry-count">{entry.count}</span>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{/each}
		</div>

		{#if prototypeEntries.length > 0}
			<div class="prototype-section">
				<button
					class="section-toggle"
					type="button"
					aria-expanded={experimentalOpen}
					onclick={() => (experimentalOpen = !experimentalOpen)}
				>
					<span>Prototyper</span>
					<span class:section-toggle__chevron--open={experimentalOpen} class="section-toggle__chevron">
						&#8964;
					</span>
				</button>

				{#if experimentalOpen}
					<div class="entry-list entry-list--proto">
						{#each prototypeEntries as entry}
							<button class="entry-card entry-card--proto" type="button" onclick={entry.onAdd} aria-label={`Lägg till ${entry.label}`}>
								<span class="entry-name">
									{entry.label}
									<span class="entry-badge entry-badge--prototype">Prototyp</span>
								</span>
								{#if entry.count > 0}
									<span class="entry-count">{entry.count}</span>
								{/if}
							</button>
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
		bottom: 4.2rem;
		left: 50%;
		transform: translateX(-50%);
		z-index: 19;
		width: auto;
		min-width: 20rem;
		max-width: calc(100vw - 2rem);
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		padding: 1rem 1.25rem;
		border: 1px solid var(--border);
		border-radius: 0.85rem;
		background: var(--surface);
		box-shadow: var(--shadow);
	}

	.panel-header {
		margin-bottom: 0.75rem;
	}

	.panel-title {
		margin: 0;
		font-size: 0.78rem;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: 1rem;
	}

	.category-label {
		margin: 0 0 0.4rem;
		font-size: 0.7rem;
		font-weight: 700;
		color: var(--muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.entry-list {
		display: grid;
		gap: 0.35rem;
	}

	.entry-list--proto {
		margin-top: 0.4rem;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
	}

	.entry-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem 0.65rem;
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		background: var(--surface-soft);
		color: var(--text);
		font: inherit;
		font-size: 0.88rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 120ms ease, border-color 120ms ease;
		text-align: left;
	}

	.entry-card:hover {
		background: color-mix(in srgb, var(--pg-blue-500) 8%, var(--surface-soft));
		border-color: color-mix(in srgb, var(--pg-blue-500) 22%, var(--border));
	}

	.entry-card--proto {
		font-size: 0.84rem;
	}

	.entry-name {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.entry-badge {
		padding: 0.08rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.58rem;
		font-weight: 700;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		vertical-align: middle;
	}

	.entry-badge--beta {
		background: color-mix(in srgb, var(--pg-orange-500) 16%, transparent);
		color: var(--pg-orange-700);
	}

	.entry-badge--prototype {
		background: color-mix(in srgb, var(--pg-blue-500) 14%, transparent);
		color: var(--pg-blue-700);
	}

	.entry-count {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 1.4rem;
		height: 1.4rem;
		padding: 0 0.35rem;
		border-radius: 0.3rem;
		font-size: 0.72rem;
		font-weight: 700;
		color: var(--muted);
		background: color-mix(in srgb, var(--text) 6%, transparent);
	}

	.prototype-section {
		margin-top: 0.85rem;
		padding-top: 0.65rem;
		border-top: 1px solid var(--border);
	}

	.section-toggle {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: 0.15rem 0;
		border: 0;
		background: transparent;
		color: var(--muted);
		font: inherit;
		font-size: 0.7rem;
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
</style>
