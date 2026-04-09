<script lang="ts">
    import AddWidgetMenu from "$lib/components/AddWidgetMenu.svelte";
    import FloatingControls from "$lib/components/FloatingControls.svelte";
    import SettingsPanel from "$lib/components/SettingsPanel.svelte";
    import AnalogClockWidget from "$lib/components/widgets/AnalogClockWidget.svelte";
    import DateWidget from "$lib/components/widgets/DateWidget.svelte";
    import DigitalClockWidget from "$lib/components/widgets/DigitalClockWidget.svelte";
    import LcdClockWidget from "$lib/components/widgets/LcdClockWidget.svelte";
    import LessonTimerWidget from "$lib/components/widgets/LessonTimerWidget.svelte";
    import BodyTextWidget from "$lib/components/widgets/BodyTextWidget.svelte";
    import LogoWidget from "$lib/components/widgets/LogoWidget.svelte";
    import TextWidget from "$lib/components/widgets/TextWidget.svelte";
    import TimerWidget from "$lib/components/widgets/TimerWidget.svelte";
    import QrCodeWidget from "$lib/components/widgets/QrCodeWidget.svelte";
    import StopwatchWidget from "$lib/components/widgets/StopwatchWidget.svelte";
    import TrelsonWidget from "$lib/components/widgets/TrelsonWidget.svelte";
    import {
        config as themeConfig,
        type TextWidgetFontVariant,
    } from "$lib/theme";
    import { onMount } from "svelte";

    type WidgetType =
        | "logo"
        | "date"
        | "digital"
        | "lcd"
        | "text"
        | "bodyText"
        | "analog"
        | "lessonTimer"
        | "timer"
        | "stopwatch"
        | "qrcode"
        | "trelson";
    type WidgetReadiness = "ready" | "beta" | "prototype";
    type Theme = "light" | "dark";
    type TrelsonPins = {
        start: string;
        resume: string;
        submit: string;
        close: string;
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
        textFont?: TextWidgetFontVariant;
        timerDuration?: number;
        timerRemaining?: number;
        timerRunning?: boolean;
        lessonTimerDurationMinutes?: number;
        lessonTimerRemaining?: number;
        lessonTimerRunning?: boolean;
        stopwatchStartTime?: number | null;
        stopwatchAccumulated?: number;
        stopwatchRunning?: boolean;
        stopwatchLaps?: number[];
        qrValue?: string;
        trelsonPins?: TrelsonPins;
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
    const TRELSON_EDIT_SECTION_COUNT = 5;
    const TRELSON_SECTION_SCALE = 0.155;
    const TRELSON_SECTION_GAP_FACTOR = 0.18;
    const trelsonEnabled = themeConfig.features.trelson;

    const widgetLabels: Record<WidgetType, string> = {
        logo: "Logga",
        date: "Datum",
        digital: "Digital klocka",
        lcd: "LCD-klocka",
        text: "Rubrik",
        bodyText: "Brödtext",
        analog: "Analog klocka",
        lessonTimer: "Analog timer",
        timer: "Digital timer",
        stopwatch: "Stoppur",
        qrcode: "QR-kod",
        trelson: "Trelson",
    };

    const widgetReadiness: Record<
        WidgetType,
        { status: WidgetReadiness; note?: string }
    > = {
        logo: { status: "ready", note: "Visar skolans logotyp som fristående widget." },
        date: { status: "ready", note: "Datumrad som skalar efter innehållet." },
        digital: { status: "ready", note: "Stor digital klocka för klassrummet." },
        lcd: { status: "ready", note: "Retro 7-segment LCD-display." },
        text: {
            status: "ready",
            note: "Stor skalande rubriktext för klassrummet.",
        },
        bodyText: {
            status: "ready",
            note: "Instruktioner, uppgifter och listor.",
        },
        analog: {
            status: "ready",
            note: "Klassisk analog klocka för klassrummet.",
        },
        lessonTimer: {
            status: "ready",
            note: "Visuell analog nedräkning för lektionspass.",
        },
        timer: {
            status: "ready",
            note: "Exakt digital timer med snabb redigering i widgeten.",
        },
        stopwatch: {
            status: "ready",
            note: "Stoppur som räknar uppåt, med varvfunktion.",
        },
        qrcode: {
            status: "ready",
            note: "Visa QR-kod för valfri URL.",
        },
        trelson: { status: "beta", note: "PIN-widget för Trelson-flöden." },
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
        logo: {
            minW: 180,
            minH: 44,
            keepAspect: true,
            aspectRatio: themeConfig.logos.aspectRatio,
        },
        date: { minW: 160, minH: 24, keepAspect: false, autoWidth: true },
        digital: { minW: 160, minH: 72, keepAspect: false, autoWidth: true },
        lcd: { minW: 240, minH: 80, keepAspect: true, aspectRatio: 2.64 },
        text: { minW: 140, minH: 40, keepAspect: false, autoWidth: true },
        bodyText: { minW: 220, minH: 140, keepAspect: false },
        analog: { minW: 220, minH: 220, keepAspect: true, aspectRatio: 1 },
        lessonTimer: {
            minW: 320,
            minH: 300,
            keepAspect: true,
            aspectRatio: 1.1,
        },
        timer: { minW: 320, minH: 170, keepAspect: true, aspectRatio: 2 },
        stopwatch: { minW: 340, minH: 140, keepAspect: true, aspectRatio: 2.5 },
        qrcode: { minW: 180, minH: 200, keepAspect: false },
        trelson: { minW: 280, minH: 120, keepAspect: false },
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
        lcd: {
            x: 0.35,
            y: 0.4,
            w: 0.3,
            z: 3,
            visible: false,
        },
        text: {
            x: 0.265,
            y: 0.3255,
            scaleH: 0.0755,
            z: 4,
            visible: false,
        },
        bodyText: {
            x: 0.35,
            y: 0.25,
            w: 0.3,
            h: 0.4,
            z: 5,
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
        stopwatch: {
            x: 0.3,
            y: 0.35,
            w: 0.35,
            h: 0.25,
            z: 8,
            visible: false,
        },
        qrcode: {
            x: 0.4,
            y: 0.2,
            w: 0.2,
            h: 0.35,
            z: 8,
            visible: false,
        },
        trelson: {
            x: 0.647,
            y: 0.13,
            w: 0.23,
            h: 0.34,
            z: 9,
            visible: false,
        },
    };
    const enabledWidgetTypes = (Object.keys(widgetDefaults) as WidgetType[]).filter(
        (type) => trelsonEnabled || type !== "trelson",
    );

    let widgetIdCounter = 0;
    const defaultTrelsonPins: TrelsonPins = {
        start: "",
        resume: "",
        submit: "",
        close: "",
    };

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
        theme === "dark" ? themeConfig.logos.dark : themeConfig.logos.light,
    );
    const hasWidgets = $derived(widgets.length > 0);
    const orderedWidgets = $derived([...widgets].sort((a, b) => a.z - b.z));
    const widgetMenuEntries = $derived(
        enabledWidgetTypes.map((type) => ({
            key: type,
            label: widgetLabels[type],
            count: widgets.filter((widget) => widget.type === type).length,
            status: widgetReadiness[type].status,
            note: widgetReadiness[type].note,
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
        if (!enabledWidgetTypes.includes(type)) {
            throw new Error(`Widget type "${type}" is disabled in the active theme.`);
        }

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
            instance.textFont = themeConfig.textWidget.defaultFont;
        }

        if (type === "bodyText") {
            instance.textValue = "Skriv instruktioner här...";
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

        if (type === "stopwatch") {
            instance.stopwatchStartTime = null;
            instance.stopwatchAccumulated = 0;
            instance.stopwatchRunning = false;
            instance.stopwatchLaps = [];
        }

        if (type === "qrcode") {
            instance.qrValue = "";
        }

        if (type === "trelson") {
            instance.trelsonPins = { ...defaultTrelsonPins };
            instance.h = getTrelsonHeight(instance.w, TRELSON_EDIT_SECTION_COUNT);
        }

        return instance;
    }

    function createInitialWidgets(
        boardWidth = INITIAL_BOARD_WIDTH,
        boardHeight = INITIAL_BOARD_HEIGHT,
    ) {
        return enabledWidgetTypes
            .filter((type) => widgetDefaults[type].visible)
            .map((type) =>
                createWidgetInstance(type, boardWidth, boardHeight, {
                    useDefaultZ: true,
                }),
            )
            .sort((a, b) => a.z - b.z);
    }

    function addWidget(type: WidgetType) {
        if (!enabledWidgetTypes.includes(type)) return;

        const { width, height } = getBoardSize();
        const offsetIndex = widgets.filter((widget) => widget.type === type).length;
        const nextWidget = createWidgetInstance(type, width, height, {
            offsetIndex,
        });

        widgets = [...widgets, nextWidget];
        selectedWidgetId = nextWidget.id;
        syncTrelsonHeight(nextWidget.id, true);
    }

    function getTrelsonSectionCount(
        widget: WidgetInstance,
        selected = selectedWidgetId === widget.id,
    ) {
        if (widget.type !== "trelson") return 0;
        if (selected) return TRELSON_EDIT_SECTION_COUNT;

        const filledCount = Object.values(widget.trelsonPins ?? defaultTrelsonPins).filter(
            (value) => value.trim().length > 0,
        ).length;

        return Math.max(1, 1 + filledCount);
    }

    function getTrelsonSectionHeightFromWidth(width: number) {
        return Math.max(44, width * TRELSON_SECTION_SCALE);
    }

    function getTrelsonGapFromSectionHeight(sectionHeight: number) {
        return sectionHeight * TRELSON_SECTION_GAP_FACTOR;
    }

    function getTrelsonHeight(width: number, sectionCount: number) {
        const sectionHeight = getTrelsonSectionHeightFromWidth(width);
        const sectionGap = getTrelsonGapFromSectionHeight(sectionHeight);

        return Math.round(
            sectionHeight * sectionCount + sectionGap * (sectionCount - 1),
        );
    }

    function getTrelsonWidthFromHeight(height: number, sectionCount: number) {
        const sectionUnit =
            TRELSON_SECTION_SCALE *
            (sectionCount + TRELSON_SECTION_GAP_FACTOR * (sectionCount - 1));

        return height / sectionUnit;
    }

    function syncTrelsonHeight(id: string, forceSelected?: boolean) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "trelson") return;

        const sectionCount = getTrelsonSectionCount(
            widget,
            forceSelected ?? selectedWidgetId === id,
        );

        widget.h = getTrelsonHeight(widget.w, sectionCount);
        widgets = [...widgets];
    }

    function selectWidget(id: string) {
        if (selectedWidgetId && selectedWidgetId !== id) {
            syncTrelsonHeight(selectedWidgetId, false);
        }
        selectedWidgetId = id;
        syncTrelsonHeight(id, true);
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

    function getStopwatchElapsed(widget: WidgetInstance) {
        const accumulated = widget.stopwatchAccumulated ?? 0;
        if (widget.stopwatchRunning && widget.stopwatchStartTime) {
            return accumulated + (Date.now() - widget.stopwatchStartTime);
        }
        return accumulated;
    }

    function toggleStopwatch(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "stopwatch") return;
        if (widget.stopwatchRunning) {
            const elapsed = getStopwatchElapsed(widget);
            widget.stopwatchAccumulated = elapsed;
            widget.stopwatchStartTime = null;
            widget.stopwatchRunning = false;
        } else {
            widget.stopwatchStartTime = Date.now();
            widget.stopwatchRunning = true;
        }
        widgets = [...widgets];
    }

    function resetStopwatch(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "stopwatch") return;
        widget.stopwatchStartTime = null;
        widget.stopwatchAccumulated = 0;
        widget.stopwatchRunning = false;
        widget.stopwatchLaps = [];
        widgets = [...widgets];
    }

    function lapStopwatch(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "stopwatch") return;
        const elapsed = getStopwatchElapsed(widget);
        widget.stopwatchLaps = [elapsed, ...(widget.stopwatchLaps ?? [])];
        widgets = [...widgets];
    }

    function updateQrValue(id: string, value: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "qrcode") return;
        widget.qrValue = value;
        widgets = [...widgets];
    }

    function toggleTheme() {
        theme = theme === "light" ? "dark" : "light";
    }

    function toggleTextWidgetFont(id: string) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "text") return;

        widget.textFont = widget.textFont === "body" ? "display" : "body";
        widgets = [...widgets];
    }

    function updateTextWidgetValue(id: string, value: string) {
        const widget = findWidget(id);
        if (!widget || (widget.type !== "text" && widget.type !== "bodyText")) return;

        widget.textValue = value;
        widgets = [...widgets];
    }

    function updateTrelsonPin(
        id: string,
        field: keyof TrelsonPins,
        value: string,
    ) {
        const widget = findWidget(id);
        if (!widget || widget.type !== "trelson") return;

        const sanitized = value.replace(/\D/g, "").slice(0, 8);
        widget.trelsonPins = {
            ...defaultTrelsonPins,
            ...widget.trelsonPins,
            [field]: sanitized,
        };
        syncTrelsonHeight(id);
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

            if (widget.type === "trelson") {
                const sectionCount = getTrelsonSectionCount(widget, true);
                const widthCandidate = resizeState.startW + deltaX;
                const heightCandidate = resizeState.startH + deltaY;
                const heightDrivenWidth = getTrelsonWidthFromHeight(
                    Math.max(constraints.minH, Math.min(heightCandidate, maxH)),
                    sectionCount,
                );

                nextW =
                    Math.abs(deltaY) > Math.abs(deltaX)
                        ? heightDrivenWidth
                        : widthCandidate;
                nextW = Math.max(constraints.minW, Math.min(nextW, maxW));

                if (snapToGrid) {
                    nextW = Math.max(
                        constraints.minW,
                        Math.min(snapValue(nextW), maxW),
                    );
                }

                const derivedHeight = getTrelsonHeight(nextW, sectionCount);

                widget.w = nextW;
                widget.h = Math.max(
                    constraints.minH,
                    Math.min(derivedHeight, maxH),
                );
                widgets = [...widgets];
                return;
            }

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
        if (selectedWidgetId) {
            syncTrelsonHeight(selectedWidgetId, false);
        }
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
    <title>{themeConfig.pageTitle}</title>
    <meta name="description" content={themeConfig.metaDescription} />
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
                {:else if widget.type === "lcd"}
                    <LcdClockWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        time={digitalTime}
                        seconds={now.getSeconds()}
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
                        font={widget.textFont ?? themeConfig.textWidget.defaultFont}
                        fontLabels={themeConfig.textWidget.fontLabels}
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
                {:else if widget.type === "bodyText"}
                    <BodyTextWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        value={widget.textValue ?? "Skriv instruktioner här..."}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                        onValueChange={(value) =>
                            updateTextWidgetValue(widget.id, value)}
                    />
                {:else if widget.type === "stopwatch"}
                    <StopwatchWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        startTime={widget.stopwatchStartTime ?? null}
                        accumulated={widget.stopwatchAccumulated ?? 0}
                        running={widget.stopwatchRunning ?? false}
                        laps={widget.stopwatchLaps ?? []}
                        onToggle={() => toggleStopwatch(widget.id)}
                        onReset={() => resetStopwatch(widget.id)}
                        onLap={() => lapStopwatch(widget.id)}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                    />
                {:else if widget.type === "qrcode"}
                    <QrCodeWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        value={widget.qrValue ?? ""}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                        onValueChange={(value) =>
                            updateQrValue(widget.id, value)}
                    />
                {:else if widget.type === "trelson"}
                    <TrelsonWidget
                        x={widget.x}
                        y={widget.y}
                        w={widget.w}
                        h={widget.h}
                        z={widget.z}
                        selected={selectedWidgetId === widget.id}
                        pins={widget.trelsonPins ?? defaultTrelsonPins}
                        onSelect={() => selectWidget(widget.id)}
                        onMoveStart={(event) => startDrag(event, widget.id)}
                        onResizeStart={(event) => startResize(event, widget.id)}
                        onBringForward={() =>
                            moveWidgetLayer(widget.id, "forward")}
                        onSendBackward={() =>
                            moveWidgetLayer(widget.id, "backward")}
                        onDelete={() => removeWidget(widget.id)}
                        onPinChange={(field, value) =>
                            updateTrelsonPin(widget.id, field, value)}
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
        background: var(--bg-bottom);
        color: var(--text);
    }

    .screen-shell::after {
        content: "";
        position: absolute;
        inset: 0;
        background:
            radial-gradient(
                ellipse 80% 60% at 15% 85%,
                color-mix(in srgb, var(--brand-primary-300) 16%, transparent),
                transparent 70%
            ),
            radial-gradient(
                ellipse 60% 50% at 85% 20%,
                color-mix(in srgb, var(--brand-warm-300) 10%, transparent),
                transparent 70%
            );
        pointer-events: none;
        z-index: 0;
    }

    .fullscreen-hint {
        position: fixed;
        left: 50%;
        bottom: 4.5rem;
        z-index: 22;
        transform: translateX(-50%);
        padding: 0.6rem 1rem;
        border: 1px solid var(--border);
        border-radius: 0.65rem;
        background: var(--hint-surface);
        color: var(--text);
        font-size: 0.85rem;
        font-weight: 700;
        letter-spacing: 0.01em;
        box-shadow: var(--shadow);
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
        font-size: 1.1rem;
        letter-spacing: 0.02em;
        color: color-mix(in srgb, var(--text) 32%, transparent);
        pointer-events: none;
    }
</style>
