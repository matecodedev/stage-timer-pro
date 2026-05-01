import { useEffect } from 'react';
import { registerDashboardKeyboardShortcuts } from '../listeners/dashboardKeyboardShortcuts.js';

export function useDashboardKeyboardShortcuts(handlers) {
  useEffect(() => registerDashboardKeyboardShortcuts({ handlers }), [handlers]);
}
