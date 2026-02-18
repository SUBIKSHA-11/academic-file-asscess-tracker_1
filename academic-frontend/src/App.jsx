import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import AccessLogs from "./pages/AccessLogs";
import Suspicious from "./pages/Suspicious";
import UsersPage from "./pages/Users";
import Layout from "./layout/Layout";
import Upload from "./pages/Upload";
import AdminList from "./pages/users/AdminList";
import FacultyList from "./pages/users/FacultyList";
import StudentList from "./pages/users/StudentList";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Login />} />

        {/* ADMIN ONLY ROUTES */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><Dashboard /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><UsersPage /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><AccessLogs /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/suspicious"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><Suspicious /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* ADMIN + FACULTY + STUDENT */}
        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <Layout><Files /></Layout>
            </ProtectedRoute>
          }
        />
<Route
  path="/upload"
  element={
    <ProtectedRoute>
      <Layout><Upload /></Layout>
    </ProtectedRoute>
  }
/>
<Route path="/users/admins" element={<Layout><AdminList /></Layout>} />
<Route path="/users/faculty" element={<Layout><FacultyList /></Layout>} />
<Route path="/users/students" element={<Layout><StudentList /></Layout>} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
