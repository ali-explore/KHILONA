import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Overview from "./pages/Overview";
import Detection from "./pages/Detection";
import Conveyor from "./pages/Conveyor";
import Performance from "./pages/Performance";
import About from "./pages/About";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="detection" element={<Detection />} />
        <Route path="conveyor" element={<Conveyor />} />
        <Route path="performance" element={<Performance />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<Overview />} />
      </Route>
    </Routes>
  );
}
