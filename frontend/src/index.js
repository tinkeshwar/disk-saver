import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './routes/App';
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";

const root = createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Theme>
      <App />
    </Theme>
  </BrowserRouter>
);
