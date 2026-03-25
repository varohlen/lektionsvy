<script lang="ts">
    import AddWidgetMenu from "$lib/components/AddWidgetMenu.svelte";
    import FloatingControls from "$lib/components/FloatingControls.svelte";
    import SettingsPanel from "$lib/components/SettingsPanel.svelte";
    import AnalogClockWidget from "$lib/components/widgets/AnalogClockWidget.svelte";
    import DateWidget from "$lib/components/widgets/DateWidget.svelte";
    import DigitalClockWidget from "$lib/components/widgets/DigitalClockWidget.svelte";
    import LessonWidget from "$lib/components/widgets/LessonWidget.svelte";
    import LessonTimerWidget from "$lib/components/widgets/LessonTimerWidget.svelte";
    import LogoWidget from "$lib/components/widgets/LogoWidget.svelte";
    import TextWidget from "$lib/components/widgets/TextWidget.svelte";
    import TimerWidget from "$lib/components/widgets/TimerWidget.svelte";
    import { onMount } from "svelte";

    type WidgetType =
        | "logo"
        | "date"
        | "digital"
        | "text"
        | "analog"
        | "lessonTimer"
        | "timer"
        | "lesson";
    type Theme = "light" | "dark";
    type TextWidgetFont = "myriad" | "knewave";
    type LessonStep = {
        label: string;
        value: string;
    };
    type WidgetConstraint = {
        minW: number;
        minH: number;
        keepAspect: boolean;
        aspectRatio?: number;
        autoWidth?: boolean;
    };
    type WidgetDefaultLayout = {
        x: number;
        y: number;
        w?: number;
        h?: number;
        scaleH?: number;
        z: number;
        visible: boolean;
    };
    type WidgetInstance = {
        id: string;
        type: WidgetType;
        x: number;
        y: number;
        w: number;
        h: number;
        scaleH?: number;
        z: number;
        textValue?: string;
        textFont?: TextWidgetFont;
        timerDuration?: number;
        timerRemaining?: number;
        timerRunning?: boolean;
        lessonTimerDurationMinutes?: number;
        lessonTimerRemaining?: number;
        lessonTimerRunning?: boolean;
        steps?: LessonStep[];
    };
    type DragState = {
        id: string;
        offsetX: number;
        offsetY: number;
    };
    type ResizeState = {
        id: string;
        startX: number;
        startY: number;
        startW: number;
        startH: number;
    };

    const INITIAL_BOARD_WIDTH = 1366;
    const INITIAL_BOARD_HEIGHT = 768;
    const GRID_SIZE = 16;

    const defaultLessonSteps: LessonStep[] = [
        { label: "Mål", value: "Kom igång och förstå uppgiften." },
        { label: "Nu", value: "Gemensam start." },
        { label: "Sedan", value: "Eget arbete." },
    ];

    const widgetLabels: Record<WidgetType, string> = {
        logo: "Logga",
        date: "Datum",
        digital: "Digital klocka",
        text: "Text",
        analog: "Analog klocka",
        lessonTimer: "Analog timer",
        timer: "Digital timer",
        lesson: "Lektionsyta",
    };

    const digitalTimeFormatter = new Intl.DateTimeFormat("sv-SE", {
        hour: "2-digit",
        minute: "2-digit",
    });

    const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const widgetConstraints: Record<WidgetType, WidgetConstraint> = {
        logo: { minW: 180, minH: 44, keepAspect: true, aspectRatio: 387 / 91 },
        date: { minW: 160, minH: 24, keepAspect: false, autoWidth: true },
        digital: { minW: 160, minH: 72, keepAspect: false, autoWidth: true },
        text: { minW: 140, minH: 40, keepAspect: false, autoWidth: true },
        analog: { minW: 220, minH: 220, keepAspect: true, aspectRatio: 1 },
        lessonTimer: {
            minW: 320,
            minH: 300,
            keepAspect: true,
            aspectRatio: 1.1,
        },
        timer: { minW: 320, minH: 170, keepAspect: true, aspectRatio: 2 },
        lesson: { minW: 260, minH: 180, keepAspect: false },
    };

    const widgetDefaults: Record<WidgetType, WidgetDefaultLayout> = {
        logo: {
            x: 0.02,
            y: 0.91,
            w: 0.15,
            z: 1,
            visible: true,
        },
        date: {
            x: 0.01,
            y: 0.105,
            scaleH: 0.03,
            z: 3,
            visible: true,
        },
        digital: {
            x: 0,
            y: 0,
            scaleH: 0.1241,
            z: 2,
            visible: true,
        },
        text: {
            x: 0.265,
            y: 0.3255,
            scaleH: 0.0755,
            z: 4,
            visible: false,
        },
        analog: {
            x: 0.0322,
            y: 0.0938,
            w: 0.205,
            z: 5,
            visible: false,
        },
        lessonTimer: {
            x: 0.5534,
            y: 0.1536,
            w: 0.3368,
            z: 6,
            visible: false,
        },
        timer: {
            x: 0.2665,
            y: 0.5026,
            w: 0.3075,
            z: 7,
            visible: false,
        },
        lesson: {
            x: 0.5974,
            y: 0.5286,
            w: 0.2489,
            h: 0.3073,
            z: 8,
            visible: false,
        },
    };

    let widgetIdCounter = 0;

    function nextWidgetId(type: WidgetType) {
        widgetIdCounter += 1;
        return `${type}-${widgetIdCounter}`;
    }

    let boardElement = $state<HTMLElement | null>(null);
    let now = $state(new Date());
    let theme = $state<Theme>("light");
    let addMenuOpen = $state(false);
    let settingsOpen = $state(false);
    let showGrid = $state(false);
    let snapToGrid = $state(false);
    let fullscreenActive = $state(false);
    let fullscreenHintVisible = $state(false);
    let selectedWidgetId = $state<string | null>(null);
    let dragState = $state<DragState | null>(null);
    let resizeState = $state<ResizeState | null>(null);
    let widgets = $state<WidgetInstance[]>(
        createInitialWidgets(INITIAL_BOARD_WIDTH, INITIAL_BOARD_HEIGHT),
    );

    const digitalTime = $derived(digitalTimeFormatter.format(now));
    const currentDate = $derived(dateFormatter.format(now));
    const secondAngle = $derived(now.getSeconds() * 6);
    const minuteAngle = $derived(now.getMinutes() * 6 + now.getSeconds() * 0.1);
    const hourAngle = $derived(
        ((now.getHours() % 12) + now.getMinutes() / 60) * 30,
    );
    const activeLogo = $derived(
        theme === "dark" ? "/pg-negativ.svg" : "/pg.svg",
    );
    const hasWidgets = $derived(widgets.length > 0);
    const orderedWidgets = $derived([...widgets].sort((a, b) => a.z - b.z));
    const widgetMenuEntries = $derived(
        (Object.keys(widgetDefaults) as WidgetType[]).map((type) => ({
            key: type,
            label: widgetLabels[type],
            count: widgets.filter((widget) => widget.type === type).length,
            onAdd: () => addWidget(type),
        })),
    );

    function getBoardSize() {
        const rect = boardElement?.getBoundingClientRect();

        return {
            width: rect?.width ?? INITIAL_BOARD_WIDTH,
            height: rect?.height ?? INITIAL_BOARD_HEIGHT,
        };
    }

    function getTopZ() {
        return widgets.reduce((maxZ, widget) => Math.max(maxZ, widget.z), 0);
    }

    function findWidget(id: string) {
        return widgets.find((widget) => widget.id === id);
    }

    function createWidgetInstance(
        type: WidgetType,
        boardWidth = INITIAL_BOARD_WIDTH,
        boardHeight = INITIAL_BOARD_HEIGHT,
        options?: {
            useDefaultZ?: boolean;
            offsetIndex?: number;
        },
    ): WidgetInstance {
        const widget = widgetDefaults[type];
        const constraints = widgetConstraints[type];
        const projectedScaleHeight =
            widget.scaleH !== undefined
                ? Math.round(widget.scaleH * boardHeight)
                : undefined;
        const projectedWidth =
            widget.w !== undefined
                ? Math.round(widget.w * boardWidth)
                : constraints.minW;
        const projectedHeight =
            projectedScaleHeight !== undefined
                ? projectedScaleHeight
                : widget.h !== undefined
                  ? Math.round(widget.h * boardHeight)
                  : constraints.keepAspect && constraints.aspectRatio
                    ? Math.round(projectedWidth / constraints.aspectRatio)
                    : constraints.minH;
        const width = Math.max(constraints.minW, projectedWidth);
        const height = Math.max(constraints.minH, projectedHeight);
        const offsetPixels = (options?.offsetIndex ?? 0) * 24;

        const instance: WidgetInstance = {
            id: nextWidgetId(type),
            type,
            x: Math.max(
                0,
                Math.min(
                    Math.round(widget.x * boardWidth) + offsetPixels,
                    boardWidth - width,
                ),
            ),
            y: Math.max(
                0,
                Math.min(
                    Math.round(widget.y * boardHeight) + offsetPixels,
                    boardHeight - height,
                ),
            ),
            w: width,
            h: height,
            z: options?.useDefaultZ ? widget.z : getTopZ() + 1,
        };

        if (projectedScaleHeight !== undefined) {
            instance.scaleH = projectedScaleHeight;
        }

        if (type === "text") {
            instance.textValue = "Skriv rubrik";
            instance.textFont = "myriad";
        }

        if (type === "timer") {
            instance.timerDuration = 15 * 60;
            instance.timerRemaining = 15 * 60;
            instance.timerRunning = false;
        }

        if (type === "lessonTimer") {
            instance.lessonTimerDurationMinutes = 60;
            instance.lessonTimerRemaining = 60 * 60;
            instance.lessonTimerRunning = false;
        }

        if (type === "lesson") {
            instance.steps = defaultLessonSteps.map((step) => ({ ...step }));
        }

        return instance;
    }

    function createInitialWidgets(
        boardWidth = INITIAL_BOARD_WIDTH,
        boardHeight = INITIAL_BOARD_HEIGHT,
    ) {
        return (Object.keys(widgetDefaults) as WidgetType[])
            .filter((type) => widgetDefaults[type].visible)
            .map((type) =>
                createWidgetInstance(type, boardWidth, boardHeight, {
                    useDefaultZ: true,
                }),
            )
            .sort((a, b) => a.z - b.z);
    }

    function addWidget(type: WidgetType) {
        const { width, height } = getBoardSize();
        const offsetIndex = widgets.filter((widget) => widget.type === type).length;
        const nextWidget = createWidgetInstance(type, width, height, {
            offsetIndex,
        });

        widgets = [...widgets, nextWidget];
        selectedWidgetId = nextWidget.id;
    }

    function selectWidget(id: string) {
        selectedWidgetId = id;
    }

    function removeWidget(id: string) {
        widgets = widgets.filter((widget) => widget.id !== id);

        if (selectedWidgetId === id) {
            selectedWidgetId = null;
        }
    }

    function moveWidgetLayer(id: string, direction: "forward" | "backward") {
        const orderedIds = [...widgets]
            .sort((a, b) => a.z - b.z)
            .map((widget) => widget.id);
        const currentIndex = orderedIds.indexOf(id);

        if (currentIndex === -1) return;

        const swapIndex =
            direction === "forward" ? currentIndex + 1 : currentIndex - 1;

        if (swapIndex < 0 || swapIndex >= orderedIds.length) return;

        const widget = findWidget(id);
        const otherWidget = findWidget(orderedIds[swapIndex]);

        if (!widget || !otherWidget) return;

        const currentZ = widget.z;
        widget.z = otherWidget.z;
        otherWidget.z = currentZ;
        widgets = [...widgets];
    }

    function setDigitalTimerSeconds(id: string, totalSeconds: number) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "timer") return;

        const nextSeconds = Math.max(
            0,
            Math.min(359999, Math.floor(totalSeconds)),
        );
        widget.timerDuration = nextSeconds;
        widget.timerRemaining = nextSeconds;
        widget.timerRunning = false;
        widgets = [...widgets];
    }

    function toggleTimer(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "timer") return;

        if ((widget.timerRemaining ?? 0) === 0) {
            widget.timerRemaining = widget.timerDuration ?? 0;
        }

        widget.timerRunning = !widget.timerRunning;
        widgets = [...widgets];
    }

    function resetTimer(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "timer") return;

        widget.timerRemaining = widget.timerDuration ?? 0;
        widget.timerRunning = false;
        widgets = [...widgets];
    }

    function setLessonTimerDuration(id: string, minutes: number) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "lessonTimer") return;

        const nextMinutes = Math.max(0, Math.min(minutes, 120));
        widget.lessonTimerDurationMinutes = nextMinutes;
        widget.lessonTimerRemaining = nextMinutes * 60;
        widget.lessonTimerRunning = false;
        widgets = [...widgets];
    }

    function toggleLessonTimer(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "lessonTimer") return;

        if ((widget.lessonTimerRemaining ?? 0) === 0) {
            widget.lessonTimerRemaining =
                (widget.lessonTimerDurationMinutes ?? 0) * 60;
        }

        widget.lessonTimerRunning = !widget.lessonTimerRunning;
        widgets = [...widgets];
    }

    function resetLessonTimer(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "lessonTimer") return;

        widget.lessonTimerRemaining =
            (widget.lessonTimerDurationMinutes ?? 0) * 60;
        widget.lessonTimerRunning = false;
        widgets = [...widgets];
    }

    function toggleTheme() {
        theme = theme === "light" ? "dark" : "light";
    }

    function toggleTextWidgetFont(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "text") return;

        widget.textFont = widget.textFont === "myriad" ? "knewave" : "myriad";
        widgets = [...widgets];
    }

    function updateTextWidgetValue(id: string, value: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "text") return;

        widget.textValue = value;
        widgets = [...widgets];
    }

    function toggleShowGrid() {
        showGrid = !showGrid;
    }

    function toggleSnapToGrid() {
        snapToGrid = !snapToGrid;
        if (snapToGrid) {
            showGrid = true;
        }
    }

    function toggleAddMenu() {
        addMenuOpen = !addMenuOpen;
        if (addMenuOpen) settingsOpen = false;
    }

    function toggleSettings() {
        settingsOpen = !settingsOpen;
        if (settingsOpen) addMenuOpen = false;
    }

    async function toggleFullscreen() {
        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen();
                return;
            }

            await document.documentElement.requestFullscreen();
        } catch (error) {
            console.error("Fullscreen failed", error);
        }
    }

    function handleFullscreenChange() {
        fullscreenActive = Boolean(document.fullscreenElement);

        if (!fullscreenActive) {
            fullscreenHintVisible = false;
            return;
        }

        addMenuOpen = false;
        settingsOpen = false;
        fullscreenHintVisible = true;

        window.setTimeout(() => {
            if (document.fullscreenElement) {
                fullscreenHintVisible = false;
            }
        }, 2600);
    }

    function formatTimer(totalSeconds: number) {
        const safeSeconds = Math.max(0, totalSeconds);
        const hours = Math.floor(safeSeconds / 3600);
        const minutes = Math.floor((safeSeconds % 3600) / 60);
        const seconds = safeSeconds % 60;

        if (hours > 0) {
            return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }

        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    function startDrag(event: PointerEvent, id: string) {
        if (!boardElement) return;

        const rect = boardElement.getBoundingClientRect();
        const widget = findWidget(id);
        if (!widget) return;

        dragState = {
            id,
            offsetX: event.clientX - rect.left - widget.x,
            offsetY: event.clientY - rect.top - widget.y,
        };
    }

    function startResize(event: PointerEvent, id: string) {
        const widget = findWidget(id);
        if (!widget) return;

        resizeState = {
            id,
            startX: event.clientX,
            startY: event.clientY,
            startW: widget.w,
            startH: widget.h,
        };
    }

    function snapValue(value: number) {
        return Math.round(value / GRID_SIZE) * GRID_SIZE;
    }

    function handlePointerMove(event: PointerEvent) {
        if (!boardElement) return;

        const rect = boardElement.getBoundingClientRect();

        if (dragState) {
            const widget = findWidget(dragState.id);
            if (!widget) return;

            const rawX = event.clientX - rect.left - dragState.offsetX;
            const rawY = event.clientY - rect.top - dragState.offsetY;
            const nextX = snapToGrid ? snapValue(rawX) : rawX;
            const nextY = snapToGrid ? snapValue(rawY) : rawY;

            widget.x = Math.max(0, Math.min(nextX, rect.width - widget.w));
            widget.y = Math.max(0, Math.min(nextY, rect.height - widget.h));
            widgets = [...widgets];
            return;
        }

        if (resizeState) {
            const widget = findWidget(resizeState.id);
            if (!widget) return;

            const deltaX = event.clientX - resizeState.startX;
            const deltaY = event.clientY - resizeState.startY;
            const constraints = widgetConstraints[widget.type];
            const maxW = rect.width - widget.x;
            const maxH = rect.height - widget.y;

            let nextW = resizeState.startW + deltaX;
            let nextH = resizeState.startH + deltaY;

            if (constraints.autoWidth) {
                const aspectRatio = resizeState.startW / resizeState.startH;
                const heightDeltaFromWidth =
                    deltaX / Math.max(aspectRatio, 0.01);
                const dominantDelta =
                    Math.abs(heightDeltaFromWidth) > Math.abs(deltaY)
                        ? heightDeltaFromWidth
                        : deltaY;

                nextH = Math.max(
                    constraints.minH,
                    Math.min(resizeState.startH + dominantDelta, maxH),
                );
                nextW = Math.max(
                    constraints.minW,
                    Math.min(nextH * aspectRatio, maxW),
                );

                if (snapToGrid) {
                    nextH = Math.max(
                        constraints.minH,
                        Math.min(snapValue(nextH), maxH),
                    );
                    nextW = Math.max(
                        constraints.minW,
                        Math.min(nextH * aspectRatio, maxW),
                    );
                }

                widget.scaleH = nextH;
                widget.h = widget.type === "text" ? Math.max(nextH, widget.h) : nextH;
                widget.w = nextW;
                widgets = [...widgets];
                return;
            }

            if (constraints.keepAspect && constraints.aspectRatio) {
                const widthDriven = Math.max(
                    constraints.minW,
                    Math.min(nextW, maxW),
                );
                const heightFromWidth = widthDriven / constraints.aspectRatio;
                const heightDriven = Math.max(
                    constraints.minH,
                    Math.min(nextH, maxH),
                );
                const widthFromHeight = heightDriven * constraints.aspectRatio;
                const widthChange = Math.abs(deltaX);
                const heightChange = Math.abs(deltaY);

                if (widthChange >= heightChange) {
                    nextW = widthDriven;
                    nextH = heightFromWidth;
                } else {
                    nextH = heightDriven;
                    nextW = widthFromHeight;
                }

                if (nextH > maxH) {
                    nextH = maxH;
                    nextW = nextH * constraints.aspectRatio;
                }

                if (nextW > maxW) {
                    nextW = maxW;
                    nextH = nextW / constraints.aspectRatio;
                }

                nextW = Math.max(constraints.minW, nextW);
                nextH = Math.max(constraints.minH, nextH);
            } else {
                nextW = Math.max(constraints.minW, Math.min(nextW, maxW));
                nextH = Math.max(constraints.minH, Math.min(nextH, maxH));
            }

            if (snapToGrid) {
                if (constraints.keepAspect && constraints.aspectRatio) {
                    nextW = Math.max(
                        constraints.minW,
                        Math.min(snapValue(nextW), maxW),
                    );
                    nextH = nextW / constraints.aspectRatio;

                    if (nextH > maxH) {
                        nextH = Math.max(
                            constraints.minH,
                            Math.min(snapValue(maxH), maxH),
                        );
                        nextW = nextH * constraints.aspectRatio;
                    }
                } else {
                    nextW = Math.max(
                        constraints.minW,
                        Math.min(snapValue(nextW), maxW),
                    );
                    nextH = Math.max(
                        constraints.minH,
                        Math.min(snapValue(nextH), maxH),
                    );
                }
            }

            widget.w = nextW;
            widget.h = nextH;
            widgets = [...widgets];
        }
    }

    function syncIntrinsicSize(id: string, size: { width: number; height: number }) {
        const widget = findWidget(id);
        if (!widget || !boardElement) return;

        const constraints = widgetConstraints[widget.type];

        if (!constraints.autoWidth) return;

        const boardRect = boardElement.getBoundingClientRect();
        const maxW = boardRect.width - widget.x;
        const maxH = boardRect.height - widget.y;
        const nextW = Math.max(constraints.minW, Math.min(size.width, maxW));
        const nextH =
            widget.type === "text"
                ? Math.max(
                      widget.scaleH ?? constraints.minH,
                      Math.min(size.height, maxH),
                  )
                : (widget.scaleH ?? widget.h);

        if (Math.abs(widget.w - nextW) < 1 && Math.abs(widget.h - nextH) < 1) {
            return;
        }

        widget.w = nextW;
        widget.h = nextH;
        widgets = [...widgets];
    }

    function stopDrag() {
        dragState = null;
        resizeState = null;
    }

    function clearSelection() {
        if (dragState || resizeState) return;
        selectedWidgetId = null;
    }

    onMount(() => {
        if (boardElement) {
            const rect = boardElement.getBoundingClientRect();
            widgets = createInitialWidgets(rect.width, rect.height);
        }

        const interval = window.setInterval(() => {
            now = new Date();
            let didTick = false;

            for (const widget of widgets) {
                if (
                    widget.type === "timer" &&
                    widget.timerRunning &&
                    (widget.timerRemaining ?? 0) > 0
                ) {
                    widget.timerRemaining = Math.max(
                        0,
                        (widget.timerRemaining ?? 0) - 1,
                    );

                    if (widget.timerRemaining === 0) {
                        widget.timerRunning = false;
                    }

                    didTick = true;
                }

                if (
                    widget.type === "lessonTimer" &&
                    widget.lessonTimerRunning &&
                    (widget.lessonTimerRemaining ?? 0) > 0
                ) {
                    widget.lessonTimerRemaining = Math.max(
                        0,
                        (widget.lessonTimerRemaining ?? 0) - 1,
                    );

                    if (widget.lessonTimerRemaining === 0) {
                        widget.lessonTimerRunning = false;
                    }

                    didTick = true;
                }
            }

            if (didTick) {
                widgets = [...widgets];
            }
        }, 1000);

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", stopDrag);
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            window.clearInterval(interval);
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", stopDrag);
            document.removeEventListener(
                "fullscreenchange",
                handleFullscreenChange,
            );
        };
    });
</script>

<svelte:head>
    <title>Partille Gymnasium Classroom Screen</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
        rel="preconnect"
        href="https://fonts.gstatic.com"
        crossorigin="anonymous"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Knewave&display=swap"
        rel="stylesheet"
    />
    <meta
        name="description"
        content="Minimalistiskt första utkast för en classroom screen för Partille Gymnasium."
    />
</svelte:head>

<div class="screen-shell" data-theme={theme}>
    {#if !fullscreenActive}
        <FloatingControls
            {theme}
            {addMenuOpen}
            {settingsOpen}
            {fullscreenActive}
            onToggleAddMenu={toggleAddMenu}
            onToggleSettings={toggleSettings}
            onToggleFullscreen={toggleFullscreen}
        />
        <AddWidgetMenu open={addMenuOpen} entries={widgetMenuEntries} />
        <SettingsPanel
            open={settingsOpen}
            {theme}
            {showGrid}
            {snapToGrid}
            onToggleTheme={toggleTheme}
            onToggleShowGrid={toggleShowGrid}
            onToggleSnapToGrid={toggleSnapToGrid}
        />
    {/if}

    {#if fullscreenHintVisible}
        <div class="fullscreen-hint" role="status" aria-live="polite">
            Tryck på ESC för att lämna helskärm
        </div>
    {/if}

    <main class="screen">
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <section
            class:grid-visible={showGrid}
            class="board"
            bind:this={boardElement}
            onpointerdown={clearSelection}
        >
            {#if !hasWidgets}
                <div class="empty-state">Välj widgets</div>
            {/if}

            {#each orderedWidgets as widget (widget.id)}
                {#if widget.type === "logo"}
                    <LogoWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        src={activeLogo}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "date"}
                    <DateWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        scaleHeight={widget.scaleH ?? widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        value={currentDate}
                        onMeasure={(size) => syncIntrinsicSize(widget.id, size)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "digital"}
                    <DigitalClockWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        scaleHeight={widget.scaleH ?? widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        time={digitalTime}
                        onMeasure={(size) => syncIntrinsicSize(widget.id, size)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "text"}
                    <TextWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        scaleHeight={widget.scaleH ?? widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        value={widget.textValue ?? "Skriv rubrik"}
                        font={widget.textFont ?? "myriad"}
                        onMeasure={(size) => syncIntrinsicSize(widget.id, size)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                        onToggleFont={() => toggleTextWidgetFont(widget.id)}
                        onValueChange={(value) =>
                            updateTextWidgetValue(widget.id, value)}
                    />
                {:else if widget.type === "analog"}
                    <AnalogClockWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        {hourAngle}
                        {minuteAngle}
                        {secondAngle}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "lessonTimer"}
                    <LessonTimerWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        durationMinutes={widget.lessonTimerDurationMinutes ?? 60}
                        remainingSeconds={widget.lessonTimerRemaining ?? 60 * 60}
                        running={widget.lessonTimerRunning ?? false}
                        onDurationChange={(minutes) =>
                            setLessonTimerDuration(widget.id, minutes)}
                        onToggle={() => toggleLessonTimer(widget.id)}
                        onReset={() => resetLessonTimer(widget.id)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "timer"}
                    <TimerWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        seconds={widget.timerRemaining ?? 15 * 60}
                        label={formatTimer(widget.timerRemaining ?? 15 * 60)}
                        progress={(widget.timerDuration ?? 0) > 0
                            ? (widget.timerRemaining ?? 0) / (widget.timerDuration ?? 1)
                            : 0}
                        running={widget.timerRunning ?? false}
                        onSetSeconds={(seconds) =>
                            setDigitalTimerSeconds(widget.id, seconds)}
                        onToggle={() => toggleTimer(widget.id)}
                        onReset={() => resetTimer(widget.id)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "lesson"}
                    <LessonWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        steps={widget.steps ?? defaultLessonSteps}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {/if}
            {/each}
        </section>
    </main>
</div>

<style>
    .screen-shell {
        position: relative;
        width: 100%;
        height: 100svh;
        overflow: hidden;
        background: linear-gradient(
            180deg,
            var(--bg-top) 0%,
            var(--bg-bottom) 100%
        );
        color: var(--text);
    }

    .fullscreen-hint {
        position: fixed;
        left: 50%;
        bottom: 1.5rem;
        z-index: 22;
        transform: translateX(-50%);
        padding: 0.7rem 1rem;
        border: 1px solid var(--border);
        border-radius: 999px;
        background: var(--hint-surface);
        color: var(--text);
        font-size: 0.88rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        box-shadow: var(--shadow);
        backdrop-filter: blur(18px);
        pointer-events: none;
    }

    .screen {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        padding: 0;
        box-sizing: border-box;
        overflow: hidden;
    }

    .board {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background: var(--canvas);
    }

    .board.grid-visible::before {
        content: "";
        position: absolute;
        inset: 0;
        pointer-events: none;
        background-image:
            linear-gradient(
                to right,
                transparent calc(50% - 1px),
                color-mix(in srgb, var(--text) 22%, transparent) calc(50% - 1px),
                color-mix(in srgb, var(--text) 22%, transparent) calc(50% + 1px),
                transparent calc(50% + 1px)
            ),
            linear-gradient(
                to bottom,
                transparent calc(50% - 1px),
                color-mix(in srgb, var(--text) 22%, transparent) calc(50% - 1px),
                color-mix(in srgb, var(--text) 22%, transparent) calc(50% + 1px),
                transparent calc(50% + 1px)
            ),
            linear-gradient(
                to right,
                color-mix(in srgb, var(--text) 8%, transparent) 1px,
                transparent 1px
            ),
            linear-gradient(
                to bottom,
                color-mix(in srgb, var(--text) 8%, transparent) 1px,
                transparent 1px
            );
        background-size:
            100% 100%,
            100% 100%,
            16px 16px,
            16px 16px;
        opacity: 0.55;
    }

    .empty-state {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        font-weight: 700;
        color: color-mix(in srgb, var(--text) 42%, transparent);
        pointer-events: none;
    }
</style>
