// MixMeet-Frontend/src/main.jsx (FINAL CORRIGIDO SEM StrictMode)

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ChakraProvider } from '@chakra-ui/react';
import { AuthProvider } from './context/AuthContext';

// Renderização síncrona para evitar erros de DOM/removeChild
ReactDOM.createRoot(document.getElementById('root')).render(
    <BrowserRouter>
      <ChakraProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ChakraProvider>
    </BrowserRouter>
);