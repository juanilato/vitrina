import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/variables.css';
import './styles/common.css';
import './styles/text-fixes.css';
import App from './App';

import { GoogleOAuthProvider } from '@react-oauth/google';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// App envuelta en google Auth Provider
root.render(
  <React.StrictMode>
<GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID!}>
      <App />
    </GoogleOAuthProvider>
  </React.StrictMode>
);
