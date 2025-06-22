export const config = {
  llmApiBase: import.meta.env.VITE_LLM_API_BASE || '',
  llmApiKey: import.meta.env.VITE_LLM_API_KEY || '',
  backendApiBase: import.meta.env.VITE_BACKEND_API_BASE || '/api',
};

export const validateConfig = () => {
  const missing = Object.entries(config)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
  
  if (missing.length > 0) {
    console.warn('Missing env variables:', missing);
  }
}; 