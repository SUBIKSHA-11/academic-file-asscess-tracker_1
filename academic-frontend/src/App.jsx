import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Files from "./pages/Files";
import AccessLogs from "./pages/AccessLogs";
import Suspicious from "./pages/Suspicious";
import Layout from "./layout/Layout";
import UsersPage from "./pages/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={
          <Layout><Dashboard /></Layout>
        } />

        <Route path="/files" element={
          <Layout><Files /></Layout>
        } />

        <Route path="/logs" element={
          <Layout><AccessLogs /></Layout>
        } />

        <Route path="/suspicious" element={
          <Layout><Suspicious /></Layout>
        } />
        <Route path="/users" element={
  <Layout><UsersPage /></Layout>
} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
