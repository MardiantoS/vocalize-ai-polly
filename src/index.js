import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Import the awsmobile constant from aws-exports.js
import awsmobile from './aws-exports';

// Configure Amplify with the awsmobile object
import { Amplify } from 'aws-amplify';

Amplify.configure(awsmobile);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();