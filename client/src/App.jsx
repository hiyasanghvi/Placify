import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Placements from "./pages/Placements";
import ProtectedRoute from "./components/ProtectedRoute";
import AddPlacement from "./pages/AddPlacement";
import Opportunities from "./pages/Opportunities";
import Messages from "./pages/Messages";
import OA from "./pages/OA";
import OAResult from "./pages/OAResult";
import ATSPage from "./pages/ATSPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/oa-result/:id" element={<OAResult />} />
        <Route path="/register" element={<Register />} />
        <Route path="/ATSPage" element={<ATSPage />} />
        
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/placements"
          element={
            <ProtectedRoute>
              <Placements />
            </ProtectedRoute>
          }
        />
        <Route
          path="/oa"
          element={
            <ProtectedRoute>
              <OA/>
            </ProtectedRoute>
          }
        />
        <Route path="/messages" element={<Messages />} />
        <Route
path="/opportunities"
element={
<ProtectedRoute>
<Opportunities />
</ProtectedRoute>
}
/>
        <Route
  path="/placements/add"
  element={
    <ProtectedRoute>
      <AddPlacement />
    </ProtectedRoute>
  }
/>

      </Routes>
    </BrowserRouter>
  );
}

export default App;