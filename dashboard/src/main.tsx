import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/context/AuthContext";
import { BrandingProvider } from "@/context/BrandingContext";
import { SetupProvider } from "@/context/SetupContext";
import "./index.css";
import { initAccentTheme } from "@/lib/accent-theme";

initAccentTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <TooltipProvider>
        <BrandingProvider>
          <SetupProvider>
            <AuthProvider>
              <App />
              <Toaster />
            </AuthProvider>
          </SetupProvider>
        </BrandingProvider>
      </TooltipProvider>
    </BrowserRouter>
  </StrictMode>,
);
