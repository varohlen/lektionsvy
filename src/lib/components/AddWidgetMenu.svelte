<script lang="ts">
	type Entry = {
		key: string;
		label: string;
		count: number;
		onAdd: () => void;
	};

	type Props = {
		open: boolean;
		entries: Entry[];
	};

	let { open, entries }: Props = $props();
</script>

{#if open}
	<div class="panel add-panel">
		<p class="panel-title">Widgets</p>

		<div class="entry-list">
			{#each entries as entry}
				<button class="entry-button" type="button" onclick={entry.onAdd}>
					<span>{entry.label}</span>
					<span>{entry.count > 0 ? `${entry.count} st` : 'Lägg till'}</span>
				</button>
			{/each}
		</div>
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

	.entry-button {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.8rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: 1rem;
		background: var(--surface-soft);
		color: var(--text);
		font: inherit;
		cursor: pointer;
	}

</style>
