// Grinrex IoT app shell — multi-page Signal Garden site with a live demo section.
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/PageShell";
import { GardenProvider } from "@/demo/GardenContext";
import AnalyticsPage from "@/demo/AnalyticsPage";
import DashboardPage from "@/demo/DashboardPage";
import IrrigationPage from "@/demo/IrrigationPage";
import WaterPage from "@/demo/WaterPage";
import ZonesPage from "@/demo/ZonesPage";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import Capabilities from "./pages/Capabilities";
import Commercial from "./pages/Commercial";
import Documents from "./pages/Documents";
import Home from "./pages/Home";
import Investor from "./pages/Investor";
import NotFound from "./pages/NotFound";
import Platform from "./pages/Platform";
import Problem from "./pages/Problem";
import Roadmap from "./pages/Roadmap";
import Safety from "./pages/Safety";
import System from "./pages/System";

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/problem" component={Problem} />
        <Route path="/system" component={System} />
        <Route path="/capabilities" component={Capabilities} />
        <Route path="/platform" component={Platform} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/safety" component={Safety} />
        <Route path="/commercial" component={Commercial} />
        <Route path="/investor" component={Investor} />
        <Route path="/documents" component={Documents} />

        {/* Live demo — one shared simulation across all demo pages */}
        <Route path="/demo" nest>
          <GardenProvider>
            <Switch>
              <Route path="/" component={DashboardPage} />
              <Route path="/zones" component={ZonesPage} />
              <Route path="/irrigation" component={IrrigationPage} />
              <Route path="/water" component={WaterPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route component={NotFound} />
            </Switch>
          </GardenProvider>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
