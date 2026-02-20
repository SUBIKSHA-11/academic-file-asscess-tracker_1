import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import Departments from "./pages/Departments";
import FacultyLayout from "./layouts/FacultyLayout";
import FacultyDashboard from "./pages/faculty/FacultyDashboard";
import FacultyMyFiles from "./pages/faculty/MyFiles";
import FacultyDepartmentFiles from "./pages/faculty/DepartmentFiles";
import FacultyUpload from "./pages/faculty/Upload";
import FacultyAnalytics from "./pages/faculty/Analytics";
import StudentLayout from "./layouts/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentBrowseFiles from "./pages/student/StudentBrowseFiles";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

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
          path="/faculty/*"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["FACULTY"]}>
                <FacultyLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<FacultyDashboard />} />
          <Route path="files" element={<FacultyMyFiles />} />
          <Route path="department-files" element={<FacultyDepartmentFiles />} />
          <Route path="upload" element={<FacultyUpload />} />
          <Route path="analytics" element={<FacultyAnalytics />} />
        </Route>

        <Route
          path="/student/*"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["STUDENT"]}>
                <StudentLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="files" element={<StudentBrowseFiles />} />
        </Route>

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

        <Route
          path="/files"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><Files /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><Upload /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/admins"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><AdminList /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/faculty"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><FacultyList /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/users/students"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><StudentList /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={["ADMIN"]}>
                <Layout><Departments /></Layout>
              </RoleRoute>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
