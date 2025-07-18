import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./modules/dashboard/Dashboard";
import routes from "./core/menuRoutes";
import AuthRoutes from "./auth/AuthRoutes";
import Login from "./pages/Login";
import { Navigate } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AuthRoutes><Dashboard /></AuthRoutes>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          {routes.map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
