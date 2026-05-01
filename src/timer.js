export function formatMs(ms, showNegative) {
  const neg = ms < 0;
  const abs = Math.abs(ms);
  const totalSec = Math.floor(abs / 1000);
  const s = totalSec % 60;
  const m = Math.floor(totalSec / 60) % 60;
  const h = Math.floor(totalSec / 3600);
  const pad = (n) => String(n).padStart(2, '0');
  const core = h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
  return neg && showNegative ? `-${core}` : core;
}

export class Countdown {
  constructor({ initialMs, warnMs = 5 * 60_000, negativeMode = false, colorThresholds = null }) {
    this.initialMs = initialMs;
    this.remainingMs = initialMs;
    this.warnMs = warnMs;
    this.running = false;
    this.negativeMode = negativeMode;
    this._lastTs = null;
    this.colorThresholds = colorThresholds || {
      critical: 2 * 60_000, // 2 minutos en ms
      warning: 5 * 60_000, // 5 minutos en ms
      caution: 10 * 60_000, // 10 minutos en ms
      good: 0.25, // 25% del tiempo total
    };
  }
  start() {
    if (!this.running) {
      this.running = true;
      this._lastTs = performance.now();
    }
  }
  pause() {
    this.running = false;
    this._lastTs = null;
  }
  stop() {
    this.running = false;
    this.remainingMs = this.initialMs;
    this._lastTs = null;
  }
  add(ms) {
    this.remainingMs += ms;
  }
  setWarnMs(ms) {
    this.warnMs = ms;
  }
  setNegative(on) {
    this.negativeMode = on;
  }
  setColorThresholds(thresholds) {
    this.colorThresholds = thresholds;
  }
  tick() {
    if (!this.running) return false;
    const now = performance.now();
    const dt = now - (this._lastTs ?? now);
    this._lastTs = now;
    this.remainingMs -= dt;

    if (this.remainingMs <= 0 && !this.negativeMode) {
      this.remainingMs = 0;
      this.running = false;
    }
    return true;
  }
  color() {
    // Si está en negativo, siempre rojo
    if (this.remainingMs <= 0) return 'red';

    // Usar umbrales avanzados si están disponibles
    if (this.colorThresholds) {
      const remainingPercent = this.remainingMs / this.initialMs;

      // Crítico: Últimos 2 minutos (o configurado)
      if (this.remainingMs <= this.colorThresholds.critical) return 'critical';

      // Warning: Últimos 5 minutos (o configurado)
      if (this.remainingMs <= this.colorThresholds.warning) return 'warning';

      // Caution: Últimos 10 minutos (o configurado)
      if (this.remainingMs <= this.colorThresholds.caution) return 'caution';

      // Good zone: Más del 25% del tiempo restante
      if (remainingPercent >= this.colorThresholds.good) return 'good';

      // Transition zone: Entre caution y good
      return 'transition';
    }

    // Fallback al sistema original
    if (this.remainingMs <= this.warnMs) return 'yellow';
    return 'green';
  }

  // Función para obtener información detallada del color
  getColorInfo() {
    const colorState = this.color();
    const remainingPercent = this.initialMs > 0 ? (this.remainingMs / this.initialMs) * 100 : 0;

    const colorMap = {
      critical: {
        name: 'Crítico',
        bgColor: '#DC2626',
        textColor: '#FFFFFF',
        intensity: 'high',
        description: 'Tiempo crítico',
      },
      warning: {
        name: 'Alerta',
        bgColor: '#EF4444',
        textColor: '#FFFFFF',
        intensity: 'medium-high',
        description: 'Pocos minutos restantes',
      },
      caution: {
        name: 'Precaución',
        bgColor: '#F59E0B',
        textColor: '#FFFFFF',
        intensity: 'medium',
        description: 'Atención al tiempo',
      },
      transition: {
        name: 'Transición',
        bgColor: '#10B981',
        textColor: '#FFFFFF',
        intensity: 'low',
        description: 'Tiempo moderado',
      },
      good: {
        name: 'Bueno',
        bgColor: '#059669',
        textColor: '#FFFFFF',
        intensity: 'none',
        description: 'Tiempo abundante',
      },
      red: {
        name: 'Terminado',
        bgColor: '#DC2626',
        textColor: '#FFFFFF',
        intensity: 'critical',
        description: 'Tiempo agotado',
      },
      yellow: {
        name: 'Advertencia',
        bgColor: '#F59E0B',
        textColor: '#FFFFFF',
        intensity: 'medium',
        description: 'Tiempo de advertencia',
      },
      green: {
        name: 'Normal',
        bgColor: '#059669',
        textColor: '#FFFFFF',
        intensity: 'none',
        description: 'Tiempo normal',
      },
    };

    return {
      state: colorState,
      remainingPercent: Math.round(remainingPercent),
      ...colorMap[colorState],
    };
  }
}
