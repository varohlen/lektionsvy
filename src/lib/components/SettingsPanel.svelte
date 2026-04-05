<script lang="ts">
    type Theme = "light" | "dark";

    type Props = {
        open: boolean;
        theme: Theme;
        showGrid: boolean;
        snapToGrid: boolean;
        onToggleTheme: () => void;
        onToggleShowGrid: () => void;
        onToggleSnapToGrid: () => void;
    };

    let {
        open,
        theme,
        showGrid,
        snapToGrid,
        onToggleTheme,
        onToggleShowGrid,
        onToggleSnapToGrid,
    }: Props = $props();
</script>

{#if open}
    <div class="panel settings-panel">
        <p class="panel-title">Inställningar</p>

        <button class="theme-row" type="button" onclick={onToggleTheme}>
            <div class="theme-copy">
                <span>Tema</span>
                <strong>{theme === "light" ? "Ljust" : "Mörkt"}</strong>
            </div>

            <div
                class:active={theme === "dark"}
                class="toggle-badge theme-toggle"
                aria-hidden="true"
            >
                <span class="toggle-icon toggle-icon-left">
                    <svg viewBox="0 0 24 24">
                        <circle
                            cx="12"
                            cy="12"
                            r="4"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="1.8"
                        />
                        <path
                            d="M12 2v2.5M12 19.5V22M4.93 4.93l1.77 1.77M17.3 17.3l1.77 1.77M2 12h2.5M19.5 12H22M4.93 19.07l1.77-1.77M17.3 6.7l1.77-1.77"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-width="1.8"
                        />
                    </svg>
                </span>
                <span class="toggle-icon toggle-icon-right">
                    <svg viewBox="0 0 24 24">
                        <path
                            d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"
                            fill="none"
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="1.8"
                        />
                    </svg>
                </span>
                <span class="toggle-thumb"></span>
            </div>
        </button>

        <div class="settings-group">
            <button class="theme-row" type="button" onclick={onToggleShowGrid}>
                <div class="theme-copy">
                    <span>Precision</span>
                    <strong>Visa rutnät</strong>
                </div>

                <div
                    class:active={showGrid}
                    class="toggle-badge"
                    aria-hidden="true"
                >
                    <span class="toggle-thumb"></span>
                </div>
            </button>

            <button
                class="theme-row"
                type="button"
                onclick={onToggleSnapToGrid}
            >
                <div class="theme-copy">
                    <span>Precision</span>
                    <strong>Snap till rutnät</strong>
                </div>

                <div
                    class:active={snapToGrid}
                    class="toggle-badge"
                    aria-hidden="true"
                >
                    <span class="toggle-thumb"></span>
                </div>
            </button>
        </div>
    </div>
{/if}

<style>
    .panel {
        position: fixed;
        bottom: 4.2rem;
        left: 50%;
        transform: translateX(-50%);
        z-index: 19;
        width: 20rem;
        padding: 1rem;
        border: 1px solid var(--border);
        border-radius: 0.85rem;
        background: var(--surface);
        box-shadow: var(--shadow);
    }

    .panel-title {
        margin: 0 0 0.75rem;
        font-size: 0.78rem;
        font-weight: 700;
        color: var(--muted);
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

    .theme-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        padding: 0.7rem 0.85rem;
        border: 1px solid var(--border);
        border-radius: 0.6rem;
        background: var(--surface-soft);
        color: var(--text);
        font: inherit;
        cursor: pointer;
        transition: background 120ms ease;
    }

    .settings-group {
        display: grid;
        gap: 0.6rem;
        margin-top: 0.6rem;
    }

    .theme-copy {
        display: grid;
        gap: 0.2rem;
        text-align: left;
    }

    .theme-copy span {
        font-size: 0.88rem;
        color: var(--muted);
    }

    .toggle-badge {
        --toggle-width: 2.8rem;
        --toggle-height: 1.7rem;
        --toggle-padding: 0.15rem;
        --toggle-thumb-size: 1.2rem;

        position: relative;
        display: inline-flex;
        align-items: center;
        width: var(--toggle-width);
        height: var(--toggle-height);
        padding: var(--toggle-padding);
        border-radius: 0.5rem;
        background: color-mix(in srgb, var(--text) 10%, transparent);
        transition: background 140ms ease;
    }

    .toggle-thumb {
        display: block;
        width: var(--toggle-thumb-size);
        height: var(--toggle-thumb-size);
        border-radius: 0.35rem;
        background: var(--surface);
        box-shadow: 0 1px 4px color-mix(in srgb, var(--text) 14%, transparent);
        transform: translateX(0);
        transition: transform 140ms ease;
    }

    .toggle-badge.active {
        background: color-mix(
            in srgb,
            var(--pg-blue-500) 34%,
            var(--surface-soft)
        );
    }

    .toggle-badge.active .toggle-thumb {
        transform: translateX(
            calc(
                var(--toggle-width) - (var(--toggle-padding) * 2) -
                    var(--toggle-thumb-size) + 0.16rem
            )
        );
    }

    .theme-toggle {
        background: color-mix(in srgb, var(--text) 10%, transparent);
    }

    .theme-toggle.active {
        background: color-mix(
            in srgb,
            var(--pg-blue-500) 34%,
            var(--surface-soft)
        );
    }

    .toggle-icon {
        position: absolute;
        top: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 0.85rem;
        height: 0.85rem;
        color: color-mix(in srgb, var(--text) 62%, transparent);
        transform: translateY(-50%);
        pointer-events: none;
        z-index: 0;
    }

    .toggle-icon-left {
        left: 0.42rem;
    }

    .toggle-icon-right {
        right: 0.42rem;
    }

    .toggle-icon svg {
        width: 100%;
        height: 100%;
    }

    .theme-toggle.active .toggle-icon-right,
    .theme-toggle:not(.active) .toggle-icon-left {
        color: color-mix(in srgb, var(--text) 88%, transparent);
    }

    .theme-toggle .toggle-thumb {
        position: relative;
        z-index: 1;
        background: color-mix(in srgb, var(--surface) 82%, white 18%);
    }

    :global(.screen-shell[data-theme="dark"]) .theme-toggle .toggle-thumb {
        background: color-mix(in srgb, var(--surface-soft) 88%, white 12%);
    }
</style>
