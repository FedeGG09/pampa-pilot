import React, { createContext, useContext, useMemo, useReducer } from 'react'
import type { AppLogEntry, SelectedLot } from '@/types/api'

interface DtcState {
  loading: boolean
  data: unknown | null
  error: string | null
}

interface FinanceState {
  loading: boolean
  data: unknown | null
  error: string | null
}

interface OrchestratorState {
  loading: boolean
  data: unknown | null
  error: string | null
}

interface AppState {
  selectedLot: SelectedLot | null
  dtc: DtcState
  finance: FinanceState
  orchestrator: OrchestratorState
  logs: AppLogEntry[]
}

type Action =
  | { type: 'select_lot'; payload: SelectedLot | null }
  | { type: 'set_dtc_loading'; payload: boolean }
  | { type: 'set_dtc_data'; payload: unknown | null }
  | { type: 'set_dtc_error'; payload: string | null }
  | { type: 'set_finance_loading'; payload: boolean }
  | { type: 'set_finance_data'; payload: unknown | null }
  | { type: 'set_finance_error'; payload: string | null }
  | { type: 'set_orchestrator_loading'; payload: boolean }
  | { type: 'set_orchestrator_data'; payload: unknown | null }
  | { type: 'set_orchestrator_error'; payload: string | null }
  | {
      type: 'push_log'
      payload: Omit<AppLogEntry, 'id' | 'ts'>
    }

const initialState: AppState = {
  selectedLot: null,
  dtc: { loading: false, data: null, error: null },
  finance: { loading: false, data: null, error: null },
  orchestrator: { loading: false, data: null, error: null },
  logs: [],
}

function nowIso(): string {
  return new Date().toISOString()
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'select_lot':
      return { ...state, selectedLot: action.payload }

    case 'set_dtc_loading':
      return { ...state, dtc: { ...state.dtc, loading: action.payload } }
    case 'set_dtc_data':
      return { ...state, dtc: { loading: false, data: action.payload, error: null } }
    case 'set_dtc_error':
      return { ...state, dtc: { loading: false, data: null, error: action.payload } }

    case 'set_finance_loading':
      return { ...state, finance: { ...state.finance, loading: action.payload } }
    case 'set_finance_data':
      return {
        ...state,
        finance: { loading: false, data: action.payload, error: null },
      }
    case 'set_finance_error':
      return { ...state, finance: { loading: false, data: null, error: action.payload } }

    case 'set_orchestrator_loading':
      return {
        ...state,
        orchestrator: { ...state.orchestrator, loading: action.payload },
      }
    case 'set_orchestrator_data':
      return {
        ...state,
        orchestrator: { loading: false, data: action.payload, error: null },
      }
    case 'set_orchestrator_error':
      return {
        ...state,
        orchestrator: { loading: false, data: null, error: action.payload },
      }

    case 'push_log':
      return {
        ...state,
        logs: [
          {
            id: crypto.randomUUID(),
            ts: nowIso(),
            ...action.payload,
          },
          ...state.logs,
        ].slice(0, 12),
      }

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const value = useMemo(() => ({ state, dispatch }), [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext)

  if (!context) {
    throw new Error('useAppContext debe usarse dentro de AppProvider')
  }

  return context
}