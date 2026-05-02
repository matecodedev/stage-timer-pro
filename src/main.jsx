import { useEffect, useMemo, useRef, useState } from 'react';
import { useLatest } from './shared/hooks/useLatest';
import { useStableCallback } from './shared/hooks/useStableCallback';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Countdown, formatMs } from './timer';
import { invoke } from '@tauri-apps/api';
import { isTauriRuntime } from './infrastructure/tauri/tauriRuntime';
import { stageWindowClient } from './infrastructure/tauri/stageWindowClient';
import { SettingsPanel } from './dashboard/components/SettingsPanel';
import { ControlsPanel } from './dashboard/components/ControlsPanel';
import { StageDisplayPanel } from './dashboard/components/StageDisplayPanel';
import { SequenceTimerFormPanel } from './dashboard/components/SequenceTimerFormPanel';
import { AdvancedColorsPanel } from './dashboard/components/AdvancedColorsPanel';
import { TimerDisplayPanel } from './dashboard/components/TimerDisplayPanel';
import { MessagePanels } from './dashboard/components/MessagePanels';
import { BrandingPanel } from './dashboard/components/BrandingPanel';
import { StagePreviewPanel } from './dashboard/components/StagePreviewPanel';
import { GlobalShortcutsPanel } from './dashboard/components/GlobalShortcutsPanel';
import { VideoIntegrationPanel } from './dashboard/components/VideoIntegrationPanel';
import { SequencePanel } from './dashboard/components/SequencePanel';
import { CurrentTimePanel } from './dashboard/components/CurrentTimePanel';
import { InitialTimePanel } from './dashboard/components/InitialTimePanel';
import { HeaderPanel } from './dashboard/components/HeaderPanel';
import { createBrandingActions } from './dashboard/brandingActions';
import { createDashboardBrandingPayload } from './dashboard/branding';
import { createDashboardStageStatePayload } from './dashboard/stageState';
import {
  createCompletedSequenceState,
  createLoadedSequenceTimerInputs,
  createLoadedSequenceTimerState,
  createSequenceJumpState,
  createSequenceTimer,
  createStartedSequenceState,
  getDefaultSequenceTimerInputs,
  getNextSequenceStep,
  shouldResetSequenceIndexAfterRemoval,
} from './dashboard/sequence';
import { useCloseStageOnExit } from './dashboard/hooks/useCloseStageOnExit';
import { useDashboardKeyboardShortcuts } from './dashboard/hooks/useDashboardKeyboardShortcuts';
import { useGlobalShortcuts } from './dashboard/hooks/useGlobalShortcuts';
import { useStageInitialDataRequest } from './dashboard/hooks/useStageInitialDataRequest';
import {
  DEFAULT_BRAND_COLORS,
  DEFAULT_BRANDING,
  DEFAULT_COLOR_THRESHOLDS,
  DEFAULT_MESSAGE_OPTIONS,
  DEFAULT_SEQUENCE_TIMER_INPUTS,
  DEFAULT_TIME_CONFIG,
  DEFAULT_TIMER_INPUTS,
  PRESET_MESSAGES,
  SEQUENCE_AUTOSTART_DELAY_MS,
  SEQUENCE_COMPLETED_TTL_MS,
  SEQUENCE_MESSAGE_TTL_MS,
  STAGE_AUTO_POSITION_DELAY_MS,
  STAGE_CREATE_READY_DELAY_MS,
  STAGE_SEND_DATA_DELAY_MS,
  TIMER_TICK_INTERVAL_MS,
} from './dashboard/constants';
import { createSequenceMessagePayload } from './dashboard/messages';
import { createMessageActions } from './dashboard/messageActions';
import { createNativeActions } from './dashboard/nativeActions';
import {
  getPreviewBackgroundColor as resolvePreviewBackgroundColor,
  getPreviewTextColor as resolvePreviewTextColor,
} from './dashboard/preview';
import { createStageActions } from './dashboard/stageActions';
import { calculateTotalMs, createColorThresholds, createTimeConfig } from './dashboard/timeConfig';

function App() {
  // Estados del timer (ahora con horas, minutos, segundos)
  const [hours, setHours] = useState(DEFAULT_TIMER_INPUTS.hours);
  const [minutes, setMinutes] = useState(DEFAULT_TIMER_INPUTS.minutes);
  const [seconds, setSeconds] = useState(DEFAULT_TIMER_INPUTS.seconds);
  const [warn, setWarn] = useState(DEFAULT_TIMER_INPUTS.warn); // en minutos
  const [neg, setNeg] = useState(DEFAULT_TIMER_INPUTS.negativeMode);

  // Estados para colores avanzados del timer
  const [colorThresholds, setColorThresholds] = useState(DEFAULT_COLOR_THRESHOLDS);
  const [enableAdvancedColors, setEnableAdvancedColors] = useState(true);

  // Estados para display de hora actual
  const [showCurrentTime, setShowCurrentTime] = useState(DEFAULT_TIME_CONFIG.showCurrentTime);
  const [timeFormat24h, setTimeFormat24h] = useState(DEFAULT_TIME_CONFIG.timeFormat24h);
  const [showSeconds, setShowSeconds] = useState(DEFAULT_TIME_CONFIG.showSeconds);
  const [timePosition, setTimePosition] = useState(DEFAULT_TIME_CONFIG.timePosition); // top-left, top-right, bottom-left, bottom-right

  // Estado para controlar fullscreen del stage
  const [isStageFullscreen, setIsStageFullscreen] = useState(true);

  // Referencias para acceder a los valores más actuales
  const timeConfigRef = useRef(DEFAULT_TIME_CONFIG);

  // Estados de mensajes mejorados
  const [message, setMessage] = useState('');
  const [messageTtl, setMessageTtl] = useState(DEFAULT_MESSAGE_OPTIONS.messageTtlSeconds); // seg
  const [persistMsg, setPersistMsg] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_MESSAGE_OPTIONS.fontSize); // px - Aumentado a 200px por defecto
  const [blinking, setBlinking] = useState(DEFAULT_MESSAGE_OPTIONS.blinking);
  const [replaceTimer, setReplaceTimer] = useState(DEFAULT_MESSAGE_OPTIONS.replaceTimer);

  // Estados de branding (solo logo)
  const [brandColors] = useState(DEFAULT_BRAND_COLORS);
  const [logo, setLogo] = useState(DEFAULT_BRANDING.logo);
  const [logoSize, setLogoSize] = useState(DEFAULT_BRANDING.logoSize); // Tamaño en píxeles, sincronizado con stage
  const [blackBackground, setBlackBackground] = useState(DEFAULT_BRANDING.blackBackground);
  const [showBranding, setShowBranding] = useState(DEFAULT_BRANDING.showBranding);

  // Estados globales para mensajes y branding actual
  const [, setCurrentGlobalMessage] = useState(null);
  const [, setCurrentGlobalBranding] = useState(null);

  // Estados para timers secuenciales
  const [timerSequence, setTimerSequence] = useState([]);
  const [currentSequenceIndex, setCurrentSequenceIndex] = useState(0);
  const [sequenceMode, setSequenceMode] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Estado temporal para agregar nuevos timers a la secuencia
  const [newTimerName, setNewTimerName] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.name);
  const [newTimerHours, setNewTimerHours] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.hours);
  const [newTimerMinutes, setNewTimerMinutes] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.minutes);
  const [newTimerSeconds, setNewTimerSeconds] = useState(DEFAULT_SEQUENCE_TIMER_INPUTS.seconds);

  // Mensajes predefinidos
  const [presetMessages] = useState(PRESET_MESSAGES);

  const timerRef = useRef(null);
  const totalMs = calculateTotalMs({ hours, minutes, seconds });
  const [state, setState] = useState({ running: false, remainingMs: totalMs, color: 'green' });
  const stateRef = useLatest(state);
  const timerInputsRef = useLatest({
    hours,
    minutes,
    seconds,
    warn,
    neg,
    colorThresholds,
    enableAdvancedColors,
  });
  const sequenceRef = useLatest({
    timerSequence,
    currentSequenceIndex,
    sequenceMode,
    autoAdvance,
  });
  const fullscreenRef = useLatest(isStageFullscreen);
  const canUseNativeStage = isTauriRuntime();

  const runTauriCommand = useStableCallback(async (commandName, args) => {
    if (!isTauriRuntime()) {
      console.debug(`Skipping Tauri command outside runtime: ${commandName}`);
      return undefined;
    }

    return args === undefined ? invoke(commandName) : invoke(commandName, args);
  });
  const {
    sendNotification,
    updateBadge,
    requestNotificationPermission,
    setStageForCapture,
    resetStageWindow,
  } = useMemo(() => createNativeActions({ runTauriCommand }), [runTauriCommand]);
  const brandingActions = useMemo(
    () =>
      createBrandingActions({
        stageWindowClient,
        setCurrentGlobalBranding,
      }),
    [],
  );

  // instanciar timer al montar
  useEffect(() => {
    const totalMs = calculateTotalMs({ hours, minutes, seconds });
    timerRef.current = new Countdown({
      initialMs: totalMs,
      warnMs: warn * 60_000,
      negativeMode: neg,
    });
    setState({ running: false, remainingMs: totalMs, color: 'green' });

    // Solicitar permisos de notificación al iniciar
    requestNotificationPermission();

    // Auto-position stage window on secondary monitor when app starts
    const autoPositionStage = async () => {
      try {
        await stageWindowClient.positionOnSecondaryMonitor();
      } catch (error) {
        console.log('Failed to auto-position stage window:', error);
      }
    };

    // Wait a bit for the stage window to be ready
    setTimeout(autoPositionStage, STAGE_AUTO_POSITION_DELAY_MS);
  }, []);

  // Aplicar siempre modo oscuro
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Efecto para enviar branding cuando cambie (solo si hay branding personalizado)
  // Inicializar timer al cargar la aplicación
  useEffect(() => {
    applyInitial();
  }, []); // Solo al montar el componente

  // Efecto para enviar configuración de hora cuando cambie
  useEffect(() => {
    if (timerRef.current) {
      pushStageState();
    }
  }, [showCurrentTime, timeFormat24h, showSeconds, timePosition]);

  // Actualizar la referencia de timeConfig cuando cambien los valores
  useEffect(() => {
    timeConfigRef.current = createTimeConfig({
      showCurrentTime,
      timeFormat24h,
      showSeconds,
      timePosition,
    });
  }, [showCurrentTime, timeFormat24h, showSeconds, timePosition]);

  // Efecto para actualizar branding automáticamente - MÁS SIMPLE
  useEffect(() => {
    brandingActions.updateBranding({
      colors: brandColors,
      logo,
      logoSize,
      blackBackground,
      showBranding,
    });
  }, [brandingActions, brandColors, logo, logoSize, blackBackground, showBranding]);

  // aplicar tiempo inicial
  const applyInitial = useStableCallback(() => {
    const inputs = timerInputsRef.current;
    const totalMs = calculateTotalMs(inputs);
    const thresholds = createColorThresholds(inputs);

    timerRef.current = new Countdown({
      initialMs: totalMs,
      warnMs: inputs.warn * 60_000,
      negativeMode: inputs.neg,
      colorThresholds: thresholds,
    });
    const nextState = { running: false, remainingMs: totalMs, color: 'green' };
    stateRef.current = nextState;
    setState(nextState);
    pushStageState();
  });

  const tick = useStableCallback(() => {
    if (!timerRef.current) return;
    const changed = timerRef.current.tick();
    if (changed) {
      const color = timerRef.current.color();
      const remainingMs = timerRef.current.remainingMs;
      const colorInfo = timerRef.current.getColorInfo();
      const prevState = stateRef.current;
      const nextState = { running: timerRef.current.running, remainingMs, color, colorInfo };
      const sequence = sequenceRef.current;

      stateRef.current = nextState;
      setState(nextState);
      pushStageState();

      // Actualizar badge con tiempo restante
      if (timerRef.current.running && remainingMs > 0) {
        const badgeText = formatMs(remainingMs, false);
        updateBadge(badgeText);
      } else if (!timerRef.current.running || remainingMs <= 0) {
        updateBadge(null); // Limpiar badge
      }

      // Notificaciones importantes
      if (timerRef.current.running) {
        // Notificación cuando el timer termina
        if (remainingMs <= 0 && prevState.remainingMs > 0) {
          sendNotification(
            '⏰ Timer Terminado',
            sequence.sequenceMode && sequence.timerSequence[sequence.currentSequenceIndex]
              ? `${sequence.timerSequence[sequence.currentSequenceIndex].name} ha finalizado`
              : 'El tiempo ha terminado',
            null,
          );
        }
        // Notificación de warning (solo una vez al entrar en estado warning)
        else if (color === 'yellow' && prevState.color !== 'yellow') {
          const warningTime = Math.ceil(remainingMs / 60000);
          sendNotification(
            '⚠️ Advertencia de Tiempo',
            `Quedan ${warningTime} minuto${warningTime !== 1 ? 's' : ''}`,
            null,
          );
        }
        // Notificación crítica (solo una vez al entrar en estado crítico)
        else if (color === 'red' && prevState.color !== 'red') {
          sendNotification('🚨 Tiempo Crítico', 'El tiempo está por agotarse', null);
        }
      }

      // Lógica de avance automático en modo secuencia
      if (
        sequence.sequenceMode &&
        sequence.autoAdvance &&
        remainingMs <= 0 &&
        timerRef.current.running
      ) {
        advanceToNextTimer();
      }
    }
  });

  // loop de 100ms
  useEffect(() => {
    const id = setInterval(tick, TIMER_TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  // controles
  const start = useStableCallback(() => {
    if (!timerRef.current) return;
    timerRef.current.start();
    pushStageState();
    const nextState = { ...stateRef.current, running: true };
    stateRef.current = nextState;
    setState(nextState);
  });
  const pause = useStableCallback(() => {
    if (!timerRef.current) return;
    timerRef.current.pause();
    pushStageState();
    const nextState = { ...stateRef.current, running: false };
    stateRef.current = nextState;
    setState(nextState);
  });
  const stop = useStableCallback(() => {
    if (!timerRef.current) return;
    timerRef.current.stop();
    pushStageState();
    const nextState = {
      ...stateRef.current,
      remainingMs: timerRef.current.remainingMs,
      running: false,
      color: 'green',
    };
    stateRef.current = nextState;
    setState(nextState);
  });

  const addMin = useStableCallback((n) => {
    if (!timerRef.current) return;
    timerRef.current.add(n * 60_000);
    pushStageState();
    const nextState = {
      ...stateRef.current,
      remainingMs: timerRef.current.remainingMs,
      color: timerRef.current.color(),
    };
    stateRef.current = nextState;
    setState(nextState);
  });

  const setWarnMin = useStableCallback((m) => {
    timerInputsRef.current = { ...timerInputsRef.current, warn: m };
    setWarn(m);
    timerRef.current?.setWarnMs(m * 60_000);
    pushStageState();
  });
  const toggleNeg = useStableCallback(() => {
    const v = !timerInputsRef.current.neg;
    timerInputsRef.current = { ...timerInputsRef.current, neg: v };
    setNeg(v);
    timerRef.current?.setNegative(v);
    pushStageState();
  });

  // Funciones para atajos globales
  const handleStartStop = useStableCallback(() => {
    if (!timerRef.current) return;
    // Usar directamente el estado del timer en lugar del estado de React
    if (timerRef.current.running) {
      pause();
    } else {
      start();
    }
  });

  const handleReset = useStableCallback(() => {
    if (!timerRef.current) return;
    stop();
    applyInitial();
  });

  const sendCurrentStageData = useStableCallback(async () => {
    await pushStageState();
    console.log('Timer state sent to stage');

    const brandingData = createDashboardBrandingPayload({
      colors: brandColors,
      logo,
      logoSize,
      blackBackground,
      showBranding,
    });
    await stageWindowClient.emitBranding(brandingData);
    console.log('Branding sent to stage');
  });

  const stageActions = useMemo(
    () =>
      createStageActions({
        stageWindowClient,
        runTauriCommand,
        getIsFullscreen: () => fullscreenRef.current,
        onFullscreenChange: (nextFullscreenState) => {
          fullscreenRef.current = nextFullscreenState;
          setIsStageFullscreen(nextFullscreenState);
        },
        sendStageData: sendCurrentStageData,
        createReadyDelayMs: STAGE_CREATE_READY_DELAY_MS,
        sendDataDelayMs: STAGE_SEND_DATA_DELAY_MS,
      }),
    [runTauriCommand, sendCurrentStageData],
  );

  const handleToggleStageFullscreen = useStableCallback(async () => {
    await stageActions.toggleStageFullscreen();
  });

  const globalShortcutHandlers = useMemo(
    () => ({
      toggleTimer: handleStartStop,
      resetTimer: handleReset,
      toggleStageFullscreen: handleToggleStageFullscreen,
    }),
    [handleStartStop, handleReset, handleToggleStageFullscreen],
  );

  useGlobalShortcuts(globalShortcutHandlers);

  // Funciones para timers secuenciales
  const addTimerToSequence = () => {
    if (!newTimerName.trim()) return;

    const newTimer = createSequenceTimer({
      id: Date.now(),
      name: newTimerName,
      hours: newTimerHours,
      minutes: newTimerMinutes,
      seconds: newTimerSeconds,
    });

    setTimerSequence((prev) => [...prev, newTimer]);
    const defaultSequenceTimerInputs = getDefaultSequenceTimerInputs();
    setNewTimerName(defaultSequenceTimerInputs.name);
    setNewTimerHours(defaultSequenceTimerInputs.hours);
    setNewTimerMinutes(defaultSequenceTimerInputs.minutes);
    setNewTimerSeconds(defaultSequenceTimerInputs.seconds);
  };

  const removeTimerFromSequence = (id) => {
    setTimerSequence((prev) => prev.filter((timer) => timer.id !== id));
    if (
      shouldResetSequenceIndexAfterRemoval({
        currentSequenceIndex,
        sequenceLengthBeforeRemoval: timerSequence.length,
      })
    ) {
      setCurrentSequenceIndex(0);
    }
  };

  const startSequence = () => {
    const sequence = sequenceRef.current;
    if (sequence.timerSequence.length === 0) return;

    sequenceRef.current = createStartedSequenceState(sequence);
    setSequenceMode(true);
    setCurrentSequenceIndex(0);
    loadTimerFromSequence(0);
    start();
  };

  const stopSequence = () => {
    sequenceRef.current = {
      ...sequenceRef.current,
      sequenceMode: false,
      currentSequenceIndex: 0,
    };
    setSequenceMode(false);
    setCurrentSequenceIndex(0);
    stop();
  };

  const loadTimerFromSequence = useStableCallback((index) => {
    const sequence = sequenceRef.current;
    const inputs = timerInputsRef.current;
    if (index >= sequence.timerSequence.length) return;

    const timer = sequence.timerSequence[index];
    timerInputsRef.current = createLoadedSequenceTimerInputs(inputs, timer);
    setHours(timer.hours);
    setMinutes(timer.minutes);
    setSeconds(timer.seconds);
    const thresholds = createColorThresholds(inputs);

    // Aplicar el timer
    timerRef.current = new Countdown({
      initialMs: timer.totalMs,
      warnMs: inputs.warn * 60_000,
      negativeMode: inputs.neg,
      colorThresholds: thresholds,
    });
    const nextState = createLoadedSequenceTimerState(timer);
    stateRef.current = nextState;
    setState(nextState);
    pushStageState();

    // Enviar mensaje con nombre del timer actual
    sendTimerMessage(`${timer.name}`, SEQUENCE_MESSAGE_TTL_MS);
  });

  const advanceToNextTimer = useStableCallback(() => {
    const sequence = sequenceRef.current;
    const sequenceStep = getNextSequenceStep({
      currentSequenceIndex: sequence.currentSequenceIndex,
      sequenceLength: sequence.timerSequence.length,
    });

    if (sequenceStep.type === 'next') {
      sequenceRef.current = {
        ...sequence,
        currentSequenceIndex: sequenceStep.nextIndex,
      };
      setCurrentSequenceIndex(sequenceStep.nextIndex);
      loadTimerFromSequence(sequenceStep.nextIndex);
      // Auto-start el siguiente timer
      setTimeout(() => {
        if (timerRef.current) {
          timerRef.current.start();
          pushStageState();
        }
      }, SEQUENCE_AUTOSTART_DELAY_MS);
    } else {
      // Secuencia completada
      sequenceRef.current = createCompletedSequenceState(sequence);
      setSequenceMode(false);
      setCurrentSequenceIndex(0);
      sendTimerMessage('SECUENCIA COMPLETADA', SEQUENCE_COMPLETED_TTL_MS);
    }
  });

  const jumpToSequenceTimer = (index) => {
    const sequence = sequenceRef.current;
    if (index >= sequence.timerSequence.length) return;

    sequenceRef.current = createSequenceJumpState(sequence, index);
    setCurrentSequenceIndex(index);
    loadTimerFromSequence(index);

    // Si estaba corriendo, continuar con el nuevo timer
    if (stateRef.current.running) {
      setTimeout(() => {
        if (timerRef.current) {
          timerRef.current.start();
          pushStageState();
        }
      }, SEQUENCE_AUTOSTART_DELAY_MS);
    }
  };

  const sendTimerMessage = useStableCallback(async (text, ttlMs = SEQUENCE_MESSAGE_TTL_MS) => {
    const messageData = createSequenceMessagePayload({ text, ttlMs });

    // Actualizar estado global
    setCurrentGlobalMessage(messageData);

    await stageWindowClient.emitMessage(messageData);

    // Actualizar estado
    await pushStageState();

    // Limpiar mensaje después del TTL
    setTimeout(() => {
      setCurrentGlobalMessage(null);
      pushStageState();
    }, ttlMs);
  });

  // Enviar estado al Stage
  const pushStageState = useStableCallback(async () => {
    if (!timerRef.current) return;

    const inputs = timerInputsRef.current;
    const sequence = sequenceRef.current;
    const payload = createDashboardStageStatePayload({
      timer: timerRef.current,
      timerInputs: inputs,
      sequence,
      timeConfig: timeConfigRef.current,
    });

    // Enviar al stage window local
    await stageWindowClient.emitState(payload);
  });
  const messageActions = useMemo(
    () =>
      createMessageActions({
        stageWindowClient,
        pushStageState,
        setCurrentGlobalMessage,
        clearDraft: () => setMessage(''),
        messageOptions: {
          persist: persistMsg,
          ttlSeconds: messageTtl,
          fontSize,
          blinking,
          replaceTimer,
        },
      }),
    [pushStageState, persistMsg, messageTtl, fontSize, blinking, replaceTimer],
  );

  const sendMessage = useStableCallback(async () => {
    await messageActions.sendMessage({ text: message });
  });

  const sendPresetMessage = async (presetText) => {
    await messageActions.sendMessage({ text: presetText, clearAfterSend: false });
  };

  // Funciones para la vista previa del stage
  const getPreviewBackgroundColor = () =>
    resolvePreviewBackgroundColor({ blackBackground, color: state.color });

  const getPreviewTextColor = () => resolvePreviewTextColor();

  const hideMessage = useStableCallback(async () => {
    await messageActions.hideMessage();
  });

  const openFullscreen = async () => {
    await stageActions.openFullscreen();
  };

  const dashboardKeyboardHandlers = useMemo(
    () => ({
      isTimerRunning: () => Boolean(timerRef.current?.running),
      start,
      pause,
      stop,
      addMin,
      sendMessage,
      hideMessage,
    }),
    [start, pause, stop, addMin, sendMessage, hideMessage],
  );

  useDashboardKeyboardShortcuts(dashboardKeyboardHandlers);

  const handleStageRequestInitialData = useStableCallback(async () => {
    // Send current timer state ONLY (no branding to avoid reset)
    await pushStageState();
    console.log('Stage requested initial data - sent timer state only');
  });

  // Listen for stage window requesting initial data
  useStageInitialDataRequest(handleStageRequestInitialData);

  // Close stage window when dashboard closes
  useCloseStageOnExit(stageWindowClient);

  const display = useMemo(() => formatMs(state.remainingMs, true), [state.remainingMs]);

  return (
    <div className="min-h-screen transition-colors dark bg-gray-900">
      <div className="p-4 max-w-6xl mx-auto space-y-4">
        <HeaderPanel />

        <div className="grid grid-cols-5 gap-4">
          <InitialTimePanel
            hours={hours}
            setHours={setHours}
            minutes={minutes}
            setMinutes={setMinutes}
            seconds={seconds}
            setSeconds={setSeconds}
            applyInitial={applyInitial}
          />

          <SequencePanel
            sequenceMode={sequenceMode}
            timerSequence={timerSequence}
            currentSequenceIndex={currentSequenceIndex}
            jumpToSequenceTimer={jumpToSequenceTimer}
            removeTimerFromSequence={removeTimerFromSequence}
            startSequence={startSequence}
            stopSequence={stopSequence}
            autoAdvance={autoAdvance}
            setAutoAdvance={setAutoAdvance}
          />

          {/* Configuración */}
          <SettingsPanel warn={warn} setWarnMin={setWarnMin} neg={neg} toggleNeg={toggleNeg} />

          {/* Controles */}
          <ControlsPanel start={start} pause={pause} stop={stop} addMin={addMin} />

          {/* Stage */}
          <StageDisplayPanel
            openFullscreen={openFullscreen}
            canOpenNativeStage={canUseNativeStage}
          />
        </div>

        <SequenceTimerFormPanel
          newTimerName={newTimerName}
          setNewTimerName={setNewTimerName}
          newTimerHours={newTimerHours}
          setNewTimerHours={setNewTimerHours}
          newTimerMinutes={newTimerMinutes}
          setNewTimerMinutes={setNewTimerMinutes}
          newTimerSeconds={newTimerSeconds}
          setNewTimerSeconds={setNewTimerSeconds}
          addTimerToSequence={addTimerToSequence}
        />

        <AdvancedColorsPanel
          enableAdvancedColors={enableAdvancedColors}
          setEnableAdvancedColors={setEnableAdvancedColors}
          colorThresholds={colorThresholds}
          setColorThresholds={setColorThresholds}
        />

        {/* Configuración de Hora Actual */}
        <CurrentTimePanel
          showCurrentTime={showCurrentTime}
          setShowCurrentTime={setShowCurrentTime}
          timeFormat24h={timeFormat24h}
          setTimeFormat24h={setTimeFormat24h}
          showSeconds={showSeconds}
          setShowSeconds={setShowSeconds}
          timePosition={timePosition}
          setTimePosition={setTimePosition}
          brandColors={brandColors}
        />

        <TimerDisplayPanel display={display} state={state} />

        <MessagePanels
          message={message}
          setMessage={setMessage}
          messageTtl={messageTtl}
          setMessageTtl={setMessageTtl}
          fontSize={fontSize}
          setFontSize={setFontSize}
          blinking={blinking}
          setBlinking={setBlinking}
          replaceTimer={replaceTimer}
          setReplaceTimer={setReplaceTimer}
          persistMsg={persistMsg}
          setPersistMsg={setPersistMsg}
          sendMessage={sendMessage}
          hideMessage={hideMessage}
          presetMessages={presetMessages}
          sendPresetMessage={sendPresetMessage}
        />

        {/* Branding y Herramientas Profesionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BrandingPanel
            logo={logo}
            setLogo={setLogo}
            logoSize={logoSize}
            setLogoSize={setLogoSize}
            showBranding={showBranding}
            setShowBranding={setShowBranding}
            blackBackground={blackBackground}
            setBlackBackground={setBlackBackground}
          />

          <StagePreviewPanel
            state={state}
            timerSequence={timerSequence}
            logo={logo}
            logoSize={logoSize}
            showBranding={showBranding}
            getPreviewBackgroundColor={getPreviewBackgroundColor}
            getPreviewTextColor={getPreviewTextColor}
          />

          <GlobalShortcutsPanel />
        </div>

        <VideoIntegrationPanel
          setStageForCapture={setStageForCapture}
          resetStageWindow={resetStageWindow}
        />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
