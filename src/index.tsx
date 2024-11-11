import App from "./App";
import { AuthProvider } from "@context/AuthContext";
import { BrowserRouter } from "react-router-dom";
import { ErrorBoundary } from "@components/index";
import { MsalProvider } from "@azure/msal-react";
import { MultiCloudProvider } from "@context/MultiCloutContext";
import ReactDOM from "react-dom/client";
import { msalInstance } from "./Services";
import reportWebVitals from "./reportWebVitals";
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  // <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
      <MsalProvider instance={msalInstance}>
        <AuthProvider>
          <MultiCloudProvider>
            <App />
          </MultiCloudProvider>
        </AuthProvider>
        </MsalProvider>
      </BrowserRouter>
    </ErrorBoundary>
  // </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
