// Smoke-test entry: exports the App and a render helper, bundled by esbuild for jsdom runs.
import { createRoot } from "react-dom/client";
import App from "../client/src/App";

export { App };

export async function renderApp(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<App />);
  return root;
}
