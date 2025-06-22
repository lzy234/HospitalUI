import { createContext, useContext, useReducer, ReactNode } from 'react';
import { GlobalState, Message, VideoInfo, ReferenceItem } from '../types';

const initialState: GlobalState = {
  video: null,
  transcript: '',
  references: [],
  messages: [],
  loading: { upload: false, parse: false, chat: false, export: false }
};

type Action = 
  | { type: 'SET_VIDEO'; payload: VideoInfo }
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'ADD_REFERENCE'; payload: ReferenceItem }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_MESSAGE'; payload: { id: string; content: string; loading: boolean } }
  | { type: 'SET_LOADING'; payload: { key: keyof GlobalState['loading']; value: boolean } };

const globalReducer = (state: GlobalState, action: Action): GlobalState => {
  switch (action.type) {
    case 'SET_VIDEO':
      return { ...state, video: action.payload };
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    case 'ADD_REFERENCE':
      return { ...state, references: [...state.references, action.payload] };
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg =>
          msg.id === action.payload.id
            ? { ...msg, content: action.payload.content, loading: action.payload.loading }
            : msg
        )
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value }
      };
    default:
      return state;
  }
};

interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const [state, dispatch] = useReducer(globalReducer, initialState);
  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (context === undefined) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
}; 