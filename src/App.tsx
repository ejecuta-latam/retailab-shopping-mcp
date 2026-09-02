import { Footer } from "./ui/Footer";
import { Header } from "./ui/Header";
import { StoreView } from "./views/aisle3d/StoreView";
import { ToolRegistrar } from "./webmcp/ToolRegistrar";

export function App() {
  return (
    <div className="app">
      <ToolRegistrar />
      <Header />
      <StoreView />
      <Footer />
    </div>
  );
}
