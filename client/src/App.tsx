// Grinrex IoT app shell — multi-page Signal Garden site with a live demo section.
// Chapter and demo pages are lazy-loaded so the landing shell stays light.
// The demo covers every product surface; its routes mirror client/src/demo/sections.ts.
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollToTop } from "@/components/PageShell";
import { GardenProvider } from "@/demo/GardenContext";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { BrandMark } from "./components/BrandMark";
import { Route, Router, Switch } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

const Home = lazy(() => import("./pages/Home"));
const Problem = lazy(() => import("./pages/Problem"));
const System = lazy(() => import("./pages/System"));
const Capabilities = lazy(() => import("./pages/Capabilities"));
const Platform = lazy(() => import("./pages/Platform"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const Safety = lazy(() => import("./pages/Safety"));
const Commercial = lazy(() => import("./pages/Commercial"));
const Investor = lazy(() => import("./pages/Investor"));
const Documents = lazy(() => import("./pages/Documents"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Live demo — fourteen pages over one shared simulation, in tab-bar order.
const DashboardPage = lazy(() => import("@/demo/DashboardPage"));
const ZonesPage = lazy(() => import("@/demo/ZonesPage"));
const IrrigationPage = lazy(() => import("@/demo/IrrigationPage"));
const WaterPage = lazy(() => import("@/demo/WaterPage"));
const HarvestPage = lazy(() => import("@/demo/HarvestPage"));
const WeatherPage = lazy(() => import("@/demo/WeatherPage"));
const CameraPage = lazy(() => import("@/demo/CameraPage"));
const FertilizerPage = lazy(() => import("@/demo/FertilizerPage"));
const TasksPage = lazy(() => import("@/demo/TasksPage"));
const RulesPage = lazy(() => import("@/demo/RulesPage"));
const DevicesPage = lazy(() => import("@/demo/DevicesPage"));
const AlertsPage = lazy(() => import("@/demo/AlertsPage"));
const AnalyticsPage = lazy(() => import("@/demo/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/demo/SettingsPage"));

function PageFallback() {
  return (
    <div className="signal-page flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-center">
        <BrandMark size={48} />
        <div className="interface text-[.62rem] font-extrabold tracking-[.22em] text-[#b8f15a]">ACQUIRING SIGNAL…</div>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    // Hash-based routing (#/demo, #/system, ...) so every page works when the
    // app is hosted as a static site on GitHub Pages (no server fallback).
    <Router hook={useHashLocation}>
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
              <Route path="/harvest" component={HarvestPage} />
              <Route path="/weather" component={WeatherPage} />
              <Route path="/camera" component={CameraPage} />
              <Route path="/fertilizer" component={FertilizerPage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/rules" component={RulesPage} />
              <Route path="/devices" component={DevicesPage} />
              <Route path="/alerts" component={AlertsPage} />
              <Route path="/analytics" component={AnalyticsPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route component={NotFound} />
            </Switch>
          </GardenProvider>
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Suspense fallback={<PageFallback />}>
            <AppRoutes />
          </Suspense>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
