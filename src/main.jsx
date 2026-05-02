import { useEffect, useMemo, useRef, useState } from 'react';
import { useLatest } from './shared/hooks/useLatest';
import { useStableCallback } from './shared/hooks/useStableCallback';
import ReactDOM from 'react-dom/client';
import './index.css';
import { Countdown, formatMs } from './timer';
import { invoke } from '@tauri-apps/api';
import { stageWindowClient } from './infrastructure/tauri/stageWindowClient';
import { Button } from './dashboard/components/Button';
import { SettingsPanel } from './dashboard/components/SettingsPanel';
import { ControlsPanel } from './dashboard/components/ControlsPanel';
import { StageDisplayPanel } from './dashboard/components/StageDisplayPanel';
import { CurrentTimePanel } from './dashboard/components/CurrentTimePanel';
import { InitialTimePanel } from './dashboard/components/InitialTimePanel';
import { HeaderPanel } from './dashboard/components/HeaderPanel';
import { createDashboardBrandingPayload } from './dashboard/branding';
import { createDashboardStageStatePayload } from './dashboard/stageState';
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
import {
  createDashboardMessagePayload,
  createSequenceMessagePayload,
  resolveMessageTtlMs,
} from './dashboard/messages';
import {
  getPreviewBackgroundColor as resolvePreviewBackgroundColor,
  getPreviewTextColor as resolvePreviewTextColor,
} from './dashboard/preview';
import {
  calculateTotalMs,
  createColorThresholds,
  createTimeConfig,
  formatDashboardTime,
} from './dashboard/timeConfig';

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
    const updateBrandingNow = async () => {
      const brandingData = createDashboardBrandingPayload({
        colors: brandColors,
        logo,
        logoSize,
        blackBackground,
        showBranding,
      });

      console.log('🔄 Updating branding immediately:', { logoSize, blackBackground, showBranding });

      // Actualizar estado global
      setCurrentGlobalBranding(brandingData);

      // Enviar al stage inmediatamente
      try {
        await stageWindowClient.emitBranding(brandingData);
        console.log('✅ Branding sent successfully');
      } catch (err) {
        console.error('❌ Error sending branding:', err);
      }
    };

    updateBrandingNow();
  }, [brandColors, logo, logoSize, blackBackground, showBranding]);

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

  const handleToggleStageFullscreen = useStableCallback(async () => {
    try {
      const nextFullscreenState = !fullscreenRef.current;
      await stageWindowClient.toggleFullscreen(nextFullscreenState);
      fullscreenRef.current = nextFullscreenState;
      setIsStageFullscreen(nextFullscreenState);
    } catch (error) {
      console.log('Error toggling stage fullscreen:', error);
    }
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

  // Funciones de notificación y badge
  const sendNotification = async (title, body, icon = null) => {
    try {
      await invoke('send_notification', { title, body, icon });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  const updateBadge = async (label) => {
    try {
      await invoke('set_badge_label', { label });
    } catch (error) {
      console.error('Error updating badge:', error);
    }
  };

  const requestNotificationPermission = async () => {
    try {
      const result = await invoke('request_notification_permission');
      console.log('Notification permission:', result);
      return result.includes('granted');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  // Funciones para integración con software de video (Resolume Arena, OBS)
  const setStageForCapture = async (width, height) => {
    try {
      await invoke('set_stage_for_capture', { width, height });
      console.log(`✅ Stage configurado para captura: ${width}x${height}`);

      // Mostrar notificación
      await sendNotification(
        'Stage Timer - Video Capture',
        `Ventana configurada para captura de video: ${width}x${height}`,
      );
    } catch (error) {
      console.error('Error configurando stage para captura:', error);
    }
  };

  const resetStageWindow = async () => {
    try {
      await invoke('reset_stage_window');
      console.log('✅ Stage window reset to normal mode');

      // Mostrar notificación
      await sendNotification('Stage Timer', 'Ventana restaurada al modo normal');
    } catch (error) {
      console.error('Error resetting stage window:', error);
    }
  };

  // Funciones para timers secuenciales
  const addTimerToSequence = () => {
    if (!newTimerName.trim()) return;

    const newTimer = {
      id: Date.now(),
      name: newTimerName.trim(),
      hours: newTimerHours,
      minutes: newTimerMinutes,
      seconds: newTimerSeconds,
      totalMs: calculateTotalMs({
        hours: newTimerHours,
        minutes: newTimerMinutes,
        seconds: newTimerSeconds,
      }),
    };

    setTimerSequence((prev) => [...prev, newTimer]);
    setNewTimerName('');
    setNewTimerHours(0);
    setNewTimerMinutes(5);
    setNewTimerSeconds(0);
  };

  const removeTimerFromSequence = (id) => {
    setTimerSequence((prev) => prev.filter((timer) => timer.id !== id));
    if (currentSequenceIndex >= timerSequence.length - 1) {
      setCurrentSequenceIndex(0);
    }
  };

  const startSequence = () => {
    const sequence = sequenceRef.current;
    if (sequence.timerSequence.length === 0) return;

    sequenceRef.current = {
      ...sequence,
      sequenceMode: true,
      currentSequenceIndex: 0,
    };
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
    timerInputsRef.current = {
      ...inputs,
      hours: timer.hours,
      minutes: timer.minutes,
      seconds: timer.seconds,
    };
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
    const nextState = { running: false, remainingMs: timer.totalMs, color: 'green' };
    stateRef.current = nextState;
    setState(nextState);
    pushStageState();

    // Enviar mensaje con nombre del timer actual
    sendTimerMessage(`${timer.name}`, SEQUENCE_MESSAGE_TTL_MS);
  });

  const advanceToNextTimer = useStableCallback(() => {
    const sequence = sequenceRef.current;
    const nextIndex = sequence.currentSequenceIndex + 1;

    if (nextIndex < sequence.timerSequence.length) {
      sequenceRef.current = {
        ...sequence,
        currentSequenceIndex: nextIndex,
      };
      setCurrentSequenceIndex(nextIndex);
      loadTimerFromSequence(nextIndex);
      // Auto-start el siguiente timer
      setTimeout(() => {
        if (timerRef.current) {
          timerRef.current.start();
          pushStageState();
        }
      }, SEQUENCE_AUTOSTART_DELAY_MS);
    } else {
      // Secuencia completada
      sequenceRef.current = {
        ...sequence,
        sequenceMode: false,
        currentSequenceIndex: 0,
      };
      setSequenceMode(false);
      setCurrentSequenceIndex(0);
      sendTimerMessage('SECUENCIA COMPLETADA', SEQUENCE_COMPLETED_TTL_MS);
    }
  });

  const jumpToSequenceTimer = (index) => {
    const sequence = sequenceRef.current;
    if (index >= sequence.timerSequence.length) return;

    sequenceRef.current = {
      ...sequence,
      currentSequenceIndex: index,
    };
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

  const sendMessage = useStableCallback(async () => {
    if (!message.trim()) return;
    const ttlMs = resolveMessageTtlMs({ persist: persistMsg, ttlSeconds: messageTtl });

    const messageData = createDashboardMessagePayload({
      text: message,
      ttlMs,
      fontSize,
      blinking,
      replaceTimer,
    });

    // Actualizar estado global
    setCurrentGlobalMessage(messageData);

    // Enviar solo el mensaje, SIN tocar el branding
    await stageWindowClient.emitMessage(messageData);

    // Actualizar estado
    await pushStageState();

    setMessage('');

    // Limpiar mensaje después del TTL (si no es persistente)
    if (!persistMsg) {
      setTimeout(() => {
        setCurrentGlobalMessage(null);
        pushStageState();
      }, ttlMs);
    }
  });

  const sendPresetMessage = async (presetText) => {
    const ttlMs = resolveMessageTtlMs({ persist: persistMsg, ttlSeconds: messageTtl });

    const messageData = createDashboardMessagePayload({
      text: presetText,
      ttlMs,
      fontSize,
      blinking,
      replaceTimer,
    });

    // Actualizar estado global
    setCurrentGlobalMessage(messageData);

    // Enviar solo el mensaje predefinido, SIN tocar el branding
    await stageWindowClient.emitMessage(messageData);

    // Actualizar estado
    await pushStageState();

    // Limpiar mensaje después del TTL (si no es persistente)
    if (!persistMsg) {
      setTimeout(() => {
        setCurrentGlobalMessage(null);
        pushStageState();
      }, ttlMs);
    }
  };

  // Funciones para la vista previa del stage
  const getPreviewBackgroundColor = () =>
    resolvePreviewBackgroundColor({ blackBackground, color: state.color });

  const getPreviewTextColor = () => resolvePreviewTextColor();

  const hideMessage = useStableCallback(async () => {
    // Limpiar mensaje global
    setCurrentGlobalMessage(null);

    await stageWindowClient.hideMessage();

    // Actualizar estado
    await pushStageState();
  });

  const openFullscreen = async () => {
    try {
      console.log('Opening stage window...');

      // First ensure stage window exists (recreate if closed)
      await invoke('create_stage_window');
      console.log('Stage window created');

      // Wait a bit for window to be ready
      await new Promise((resolve) => setTimeout(resolve, STAGE_CREATE_READY_DELAY_MS));

      // Position the stage window on secondary monitor and make fullscreen
      await stageWindowClient.positionOnSecondaryMonitor();
      console.log('Stage positioned on secondary monitor');

      // Focus the stage window
      await invoke('focus_stage');
      console.log('Stage focused');

      // Wait a moment then send current state and branding
      setTimeout(async () => {
        try {
          // Send current timer state
          await pushStageState();
          console.log('Timer state sent to stage');

          // Send current branding to ensure new window has correct branding
          const brandingData = createDashboardBrandingPayload({
            colors: brandColors,
            logo,
            logoSize,
            blackBackground,
            showBranding,
          });
          await stageWindowClient.emitBranding(brandingData);
          console.log('Branding sent to stage');
        } catch (error) {
          console.error('Error sending data to stage:', error);
        }
      }, STAGE_SEND_DATA_DELAY_MS);
    } catch (error) {
      console.error('Error opening stage window:', error);
    }
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

          {/* Timers Secuenciales */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow space-y-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">📋 Secuencia</h3>

            {/* Estado actual de la secuencia */}
            {sequenceMode && timerSequence.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  Activo: {timerSequence[currentSequenceIndex]?.name}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400">
                  {currentSequenceIndex + 1} de {timerSequence.length}
                </div>
              </div>
            )}

            {/* Lista de timers en la secuencia */}
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {timerSequence.map((timer, index) => (
                <div
                  key={timer.id}
                  className={`flex items-center justify-between p-1.5 rounded text-xs ${
                    sequenceMode && index === currentSequenceIndex
                      ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 dark:bg-gray-700'
                  }`}
                >
                  <div className="flex-1 truncate">
                    <div className="font-medium text-gray-900 dark:text-white">{timer.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">
                      {String(timer.hours).padStart(2, '0')}:
                      {String(timer.minutes).padStart(2, '0')}:
                      {String(timer.seconds).padStart(2, '0')}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => jumpToSequenceTimer(index)}
                      className="text-blue-500 hover:text-blue-700 disabled:opacity-50"
                      disabled={!sequenceMode}
                      title="Saltar a este timer"
                    >
                      ▶️
                    </button>
                    <button
                      onClick={() => removeTimerFromSequence(timer.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                    >
                      ❌
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Controles de secuencia */}
            <div className="space-y-2">
              <div className="flex gap-1">
                <Button
                  onClick={startSequence}
                  variant="success"
                  className="flex-1 text-xs"
                  disabled={timerSequence.length === 0 || sequenceMode}
                >
                  🎬 Iniciar Secuencia
                </Button>
                <Button
                  onClick={stopSequence}
                  variant="danger"
                  className="flex-1 text-xs"
                  disabled={!sequenceMode}
                >
                  ⏹️ Detener
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="autoAdvance"
                  type="checkbox"
                  checked={autoAdvance}
                  onChange={(e) => setAutoAdvance(e.target.checked)}
                  className="text-blue-500"
                />
                <label htmlFor="autoAdvance" className="text-xs text-gray-600 dark:text-gray-300">
                  Avance automático
                </label>
              </div>
            </div>
          </div>

          {/* Configuración */}
          <SettingsPanel warn={warn} setWarnMin={setWarnMin} neg={neg} toggleNeg={toggleNeg} />

          {/* Controles */}
          <ControlsPanel start={start} pause={pause} stop={stop} addMin={addMin} />

          {/* Stage */}
          <StageDisplayPanel openFullscreen={openFullscreen} />
        </div>

        {/* Agregar Timer a Secuencia */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            ➕ Agregar Timer a Secuencia
          </h3>
          <div className="grid grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300">Nombre del Timer</label>
              <input
                type="text"
                value={newTimerName}
                onChange={(e) => setNewTimerName(e.target.value)}
                placeholder="ej: Introducción"
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300">Horas</label>
              <input
                type="number"
                value={newTimerHours}
                onChange={(e) => setNewTimerHours(Math.max(0, +e.target.value || 0))}
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300">Minutos</label>
              <input
                type="number"
                value={newTimerMinutes}
                onChange={(e) =>
                  setNewTimerMinutes(Math.max(0, Math.min(59, +e.target.value || 0)))
                }
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                max="59"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-300">Segundos</label>
              <input
                type="number"
                value={newTimerSeconds}
                onChange={(e) =>
                  setNewTimerSeconds(Math.max(0, Math.min(59, +e.target.value || 0)))
                }
                className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
                max="59"
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={addTimerToSequence}
                variant="success"
                className="w-full"
                disabled={!newTimerName.trim()}
              >
                ➕ Agregar
              </Button>
            </div>
          </div>

          {/* Plantillas rápidas */}
          <div className="mt-3 pt-3 border-t dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
              🎯 Plantillas Rápidas:
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  setNewTimerName('Introducción');
                  setNewTimerMinutes(5);
                  setNewTimerSeconds(0);
                }}
                variant="default"
                className="text-xs"
              >
                📢 Introducción (5m)
              </Button>
              <Button
                onClick={() => {
                  setNewTimerName('Presentación');
                  setNewTimerMinutes(15);
                  setNewTimerSeconds(0);
                }}
                variant="default"
                className="text-xs"
              >
                🎤 Presentación (15m)
              </Button>
              <Button
                onClick={() => {
                  setNewTimerName('Q&A');
                  setNewTimerMinutes(10);
                  setNewTimerSeconds(0);
                }}
                variant="default"
                className="text-xs"
              >
                ❓ Q&A (10m)
              </Button>
              <Button
                onClick={() => {
                  setNewTimerName('Descanso');
                  setNewTimerMinutes(15);
                  setNewTimerSeconds(0);
                }}
                variant="default"
                className="text-xs"
              >
                ☕ Descanso (15m)
              </Button>
              <Button
                onClick={() => {
                  setNewTimerName('Cierre');
                  setNewTimerMinutes(5);
                  setNewTimerSeconds(0);
                }}
                variant="default"
                className="text-xs"
              >
                🎯 Cierre (5m)
              </Button>
            </div>
          </div>
        </div>

        {/* Configuración Avanzada de Colores */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              🎨 Colores Avanzados del Timer
            </h3>
            <div className="flex items-center gap-2">
              <input
                id="enableAdvancedColors"
                type="checkbox"
                checked={enableAdvancedColors}
                onChange={(e) => setEnableAdvancedColors(e.target.checked)}
                className="text-blue-500"
              />
              <label
                htmlFor="enableAdvancedColors"
                className="text-xs text-gray-600 dark:text-gray-300"
              >
                Activar colores avanzados
              </label>
            </div>
          </div>

          {enableAdvancedColors && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    🔴 Crítico (min)
                  </label>
                  <input
                    type="number"
                    value={colorThresholds.critical}
                    onChange={(e) =>
                      setColorThresholds((prev) => ({
                        ...prev,
                        critical: Math.max(0, +e.target.value || 0),
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                  <div className="text-xs text-gray-400 mt-1">Últimos minutos</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    🟠 Alerta (min)
                  </label>
                  <input
                    type="number"
                    value={colorThresholds.warning}
                    onChange={(e) =>
                      setColorThresholds((prev) => ({
                        ...prev,
                        warning: Math.max(0, +e.target.value || 0),
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                  <div className="text-xs text-gray-400 mt-1">Tiempo de alerta</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    🟡 Precaución (min)
                  </label>
                  <input
                    type="number"
                    value={colorThresholds.caution}
                    onChange={(e) =>
                      setColorThresholds((prev) => ({
                        ...prev,
                        caution: Math.max(0, +e.target.value || 0),
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                  />
                  <div className="text-xs text-gray-400 mt-1">Tiempo de atención</div>
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                    🟢 Bueno (%)
                  </label>
                  <input
                    type="number"
                    value={colorThresholds.good}
                    onChange={(e) =>
                      setColorThresholds((prev) => ({
                        ...prev,
                        good: Math.max(0, Math.min(100, +e.target.value || 0)),
                      }))
                    }
                    className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    min="0"
                    max="100"
                  />
                  <div className="text-xs text-gray-400 mt-1">% tiempo restante</div>
                </div>
              </div>

              {/* Vista previa de colores */}
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  Vista previa de estados:
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#059669' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Bueno (&gt;{colorThresholds.good}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">Transición</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Precaución ({colorThresholds.caution}m)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Alerta ({colorThresholds.warning}m)
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DC2626' }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      Crítico ({colorThresholds.critical}m)
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de presets */}
              <div className="mt-3 pt-3 border-t dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                  Presets rápidos:
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={() =>
                      setColorThresholds({ critical: 1, warning: 3, caution: 5, good: 50 })
                    }
                    variant="default"
                    className="text-xs"
                  >
                    🚀 Presentación Rápida
                  </Button>
                  <Button
                    onClick={() =>
                      setColorThresholds({ critical: 2, warning: 5, caution: 10, good: 25 })
                    }
                    variant="default"
                    className="text-xs"
                  >
                    📋 Conferencia Estándar
                  </Button>
                  <Button
                    onClick={() =>
                      setColorThresholds({ critical: 5, warning: 15, caution: 30, good: 20 })
                    }
                    variant="default"
                    className="text-xs"
                  >
                    🎓 Evento Largo
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>

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

        {/* Display del reloj */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                ⏱️ Tiempo Restante
              </div>
              <div className="text-5xl font-mono font-bold text-gray-900 dark:text-white">
                {display}
              </div>
            </div>
            <span
              className={`px-4 py-2 rounded-lg text-sm font-semibold border flex items-center gap-2 ${
                state.color === 'green' &&
                'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
              } ${
                state.color === 'yellow' &&
                'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
              } ${
                state.color === 'red' &&
                'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
              } ${
                (state.color === 'critical' || state.color === 'warning') &&
                'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
              } ${
                state.color === 'caution' &&
                'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700'
              } ${
                (state.color === 'transition' || state.color === 'good') &&
                'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
              }`}
            >
              {state.colorInfo ? (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: state.colorInfo.bgColor }}
                  />
                  <div>
                    <div>{state.colorInfo.name}</div>
                    <div className="text-xs opacity-70">{state.colorInfo.remainingPercent}%</div>
                  </div>
                </>
              ) : (
                state.color.toUpperCase()
              )}
            </span>
          </div>
        </div>

        {/* Mensajes y Comunicación */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Mensaje personalizado */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">💬</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Mensaje Personalizado</h3>
            </div>

            <div className="space-y-3">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Tamaño
                  </label>
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Math.max(12, +e.target.value || 200))}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                    min="12"
                    placeholder="200px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Duración
                  </label>
                  <input
                    type="number"
                    value={messageTtl}
                    onChange={(e) => setMessageTtl(+e.target.value || 0)}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 dark:text-white"
                    placeholder="5s"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Opciones
                  </label>
                  <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={blinking}
                        onChange={(e) => setBlinking(e.target.checked)}
                        className="w-3 h-3 text-blue-600 rounded"
                      />
                      <span className="text-gray-600 dark:text-gray-300">Titila</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs">
                      <input
                        type="checkbox"
                        checked={replaceTimer}
                        onChange={(e) => setReplaceTimer(e.target.checked)}
                        className="w-3 h-3 text-blue-600 rounded"
                      />
                      <span className="text-gray-600 dark:text-gray-300">Reemplaza timer</span>
                    </label>
                  </div>
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={persistMsg}
                  onChange={(e) => setPersistMsg(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-gray-600 dark:text-gray-300">
                  Mantener hasta ocultar manualmente
                </span>
              </label>

              <div className="flex gap-2">
                <Button onClick={sendMessage} variant="primary" className="flex-1 text-sm py-2">
                  📤 Enviar
                </Button>
                <Button onClick={hideMessage} variant="danger" className="flex-1 text-sm py-2">
                  🚫 Ocultar
                </Button>
              </div>
            </div>
          </div>

          {/* Mensajes predefinidos */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Mensajes Predefinidos</h3>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {presetMessages.map((preset, index) => (
                <Button
                  key={index}
                  onClick={() => sendPresetMessage(preset)}
                  variant="default"
                  className="text-xs py-2 px-3 hover:scale-105 transition-transform"
                >
                  {preset}
                </Button>
              ))}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  💡 Configuración:
                </span>{' '}
                Los mensajes usan el tamaño, titilación y duración actuales.
              </div>
            </div>
          </div>
        </div>

        {/* Branding y Herramientas Profesionales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Branding del Evento */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Branding del Evento</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  URL del Logo
                </label>
                <input
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://ejemplo.com/logo.png"
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <span>💡</span> Recomendado: 200×80px, PNG/JPG
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Tamaño del Logo (px)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="24"
                    max="120"
                    value={logoSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      console.log('🎛️ SLIDER CHANGED TO:', newSize);
                      setLogoSize(newSize);
                    }}
                    className="flex-1"
                  />
                  <input
                    type="number"
                    min="24"
                    max="120"
                    value={logoSize}
                    onChange={(e) => {
                      const newSize = Math.max(24, Math.min(120, Number(e.target.value)));
                      console.log('🔢 INPUT CHANGED TO:', newSize);
                      setLogoSize(newSize);
                    }}
                    className="w-16 border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-700 dark:text-white"
                  />
                  <span className="text-xs text-gray-500 dark:text-gray-400">px</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showBranding}
                    onChange={(e) => setShowBranding(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-gray-600 dark:text-gray-300">Mostrar logo</span>
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={blackBackground}
                    onChange={(e) => setBlackBackground(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span className="text-gray-600 dark:text-gray-300">Fondo negro</span>
                </label>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-purple-600 dark:text-purple-400">
                    ℹ️ Información:
                  </span>{' '}
                  Los colores del stage se configuran automáticamente según el estado del timer
                  (verde, amarillo, rojo).
                </div>
              </div>
            </div>
          </div>

          {/* Vista Previa del Stage */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">👁️</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Vista Previa del Stage
              </h3>
            </div>

            <div className="space-y-3">
              {/* Simulación del Stage en miniatura */}
              <div
                className="relative border border-gray-300 dark:border-gray-600 rounded-lg aspect-video flex flex-col items-center justify-center text-center overflow-hidden"
                style={{
                  minHeight: '200px',
                  backgroundColor: getPreviewBackgroundColor(),
                }}
              >
                {/* Timer Principal */}
                <div
                  className="text-4xl font-mono font-bold mb-2"
                  style={{
                    color: getPreviewTextColor(),
                  }}
                >
                  {formatDashboardTime(state.remainingMs)}
                </div>

                {/* Nombre del Timer */}
                {state.currentTimerName && (
                  <div
                    className="text-lg font-medium mb-2 opacity-80"
                    style={{
                      color: getPreviewTextColor(),
                    }}
                  >
                    {state.currentTimerName}
                  </div>
                )}

                {/* Mensaje si existe */}
                {state.messageShown && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div
                      className="text-xl font-bold text-center px-4 text-white"
                      style={{
                        fontSize: Math.min(24, (state.messageFontSize || 200) * 0.1) + 'px',
                      }}
                    >
                      {state.messageText}
                    </div>
                  </div>
                )}

                {/* Logo si está configurado - centrado como en el stage */}
                {logo && showBranding && (
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                    <img
                      src={logo}
                      alt="Logo"
                      className="w-auto object-contain opacity-80"
                      style={{ height: logoSize * 0.67 + 'px' }} // Escalado para vista previa
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Branding matecode - SIEMPRE VISIBLE */}
                <div
                  className="absolute bottom-2 right-2 text-xs opacity-60"
                  style={{
                    color: getPreviewTextColor(),
                  }}
                >
                  Hecho con ♥ por MateCode
                </div>

                {/* Barra de progreso */}
                <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-30 w-full">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{
                      width: `${Math.max(0, Math.min(100, ((state.totalMs - state.remainingMs) / state.totalMs) * 100))}%`,
                      backgroundColor: getPreviewTextColor(),
                    }}
                  ></div>
                </div>
              </div>

              {/* Información del estado actual */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium text-gray-600 dark:text-gray-300">Estado</div>
                  <div className="text-gray-800 dark:text-gray-200 capitalize">
                    {state.color || 'Detenido'}
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium text-gray-600 dark:text-gray-300">Progreso</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {Math.round(((state.totalMs - state.remainingMs) / state.totalMs) * 100 || 0)}%
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium text-gray-600 dark:text-gray-300">Secuencia</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {state.currentSequenceIndex !== null
                      ? `${state.currentSequenceIndex + 1}/${timerSequence.length}`
                      : 'Individual'}
                  </div>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <div className="font-medium text-gray-600 dark:text-gray-300">Mensaje</div>
                  <div className="text-gray-800 dark:text-gray-200">
                    {state.messageShown ? 'Visible' : 'Oculto'}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="text-xs text-blue-700 dark:text-blue-300">
                  <span className="font-medium">🔄 Actualización en tiempo real:</span> Esta vista
                  previa refleja exactamente lo que se muestra en el Stage.
                </div>
              </div>
            </div>
          </div>

          {/* Atajos Globales */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Atajos Globales</h3>
            </div>

            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
                  ⌘+Shift+Space
                </code>
                <span className="text-xs text-gray-600 dark:text-gray-300">Start/Pause</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
                  ⌘+Shift+R
                </code>
                <span className="text-xs text-gray-600 dark:text-gray-300">Reset Timer</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded text-xs border border-gray-200 dark:border-gray-600">
                  ⌘+Shift+F
                </code>
                <span className="text-xs text-gray-600 dark:text-gray-300">Toggle Fullscreen</span>
              </div>
            </div>

            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-xs text-green-700 dark:text-green-300 flex items-center gap-1">
                <span>✅</span> Activos desde cualquier aplicación
              </div>
            </div>
          </div>
        </div>

        {/* Integración con Software de Video */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🎥</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Integración con Software de Video
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Configuración de Captura */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                Configurar Stage para Captura
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => setStageForCapture(1920, 1080)}
                  variant="primary"
                  className="text-xs py-2"
                >
                  📺 1920×1080
                </Button>
                <Button
                  onClick={() => setStageForCapture(1280, 720)}
                  variant="primary"
                  className="text-xs py-2"
                >
                  📺 1280×720
                </Button>
                <Button
                  onClick={() => setStageForCapture(1024, 768)}
                  variant="primary"
                  className="text-xs py-2"
                >
                  📺 1024×768
                </Button>
                <Button
                  onClick={() => resetStageWindow()}
                  variant="warning"
                  className="text-xs py-2"
                >
                  🔄 Reset
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => window.open('https://obsproject.com/', '_blank')}
                  variant="default"
                  className="text-xs flex-1 py-2"
                >
                  📥 OBS Studio
                </Button>
                <Button
                  onClick={() => window.open('https://ndi.video/tools/', '_blank')}
                  variant="default"
                  className="text-xs flex-1 py-2"
                >
                  📥 NDI Tools
                </Button>
              </div>
            </div>

            {/* Métodos de Integración */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                Métodos de Integración
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                  <div className="font-medium text-blue-800 dark:text-blue-300 mb-1">
                    🥇 NDI (Recomendado)
                  </div>
                  <div className="text-blue-700 dark:text-blue-400">
                    Calidad profesional • Sin lag • Fácil setup
                  </div>
                </div>

                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-800">
                  <div className="font-medium text-green-800 dark:text-green-300 mb-1">
                    🥈 OBS Virtual Camera
                  </div>
                  <div className="text-green-700 dark:text-green-400">
                    Gratis • Compatible con todo • Fácil
                  </div>
                </div>

                <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
                  <div className="font-medium text-orange-800 dark:text-orange-300 mb-1">
                    🥉 Captura Directa
                  </div>
                  <div className="text-orange-700 dark:text-orange-400">
                    Básico • Mayor uso de CPU
                  </div>
                </div>
              </div>

              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                <div className="text-xs text-purple-700 dark:text-purple-300">
                  💡 <strong>Tip:</strong> Usa fondo negro para mejor chromakey
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
