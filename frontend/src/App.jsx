import Pipeline from "./pages/Pipeline";
import Deals from "./pages/Deals";
import Users from "./pages/Users";
import Tasks from "./pages/Tasks";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import Analytics from "./pages/Analytics";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Customers from "./pages/Customers";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import LeadDetail from "./pages/LeadDetail";
import Teams from "./pages/Teams";
import Automation from "./pages/Automation";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import Followups from "./pages/Followups";
import Calls from "./pages/Calls";
import WhatsappInbox from "./pages/WhatsappInbox";
import EmailInbox from "./pages/EmailInbox";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import AddCourse from "./pages/AddCourse";
import Enrollments from "./pages/Enrollments";
import Payments from "./pages/Payments";
import Batches from "./pages/Batches";
import { ThemeProvider } from "./context/ThemeProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Frontend-side guard for admin/manager-only pages — the Sidebar already
// hides these links from a caller, but this stops direct URL navigation
// too. The backend remains the actual source of truth for data access.
function RequireRole({ roles, children }) {
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  const token = localStorage.getItem("token");

  const theme = localStorage.getItem("theme") || "dark";

  return (
    <ThemeProvider>
    <ToastContainer
      position="top-right"
      autoClose={3500}
      theme={theme}
      newestOnTop
    />
    <Routes>
      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={
          token ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/forgot-password"
        element={
          token ? <Navigate to="/dashboard" replace /> : <ForgotPassword />
        }
      />
      {/* Always reachable regardless of any stale token in localStorage —
          a locked-out user must always be able to complete a reset link. */}
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Protected Routes */}
      <Route
        element={
          token ? (
            <MainLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/leads" element={<Leads />} />
        <Route path="/leads/:id" element={<LeadDetail />} />
     <Route path="/customers" element={<Customers />} />
     <Route
       path="/deals"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Deals />
         </RequireRole>
       }
     />
     <Route
       path="/pipeline"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Pipeline />
         </RequireRole>
       }
     />
     <Route
       path="/users"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Users />
         </RequireRole>
       }
     />
     <Route
       path="/automation"
       element={
         <RequireRole roles={["admin"]}>
           <Automation />
         </RequireRole>
       }
     />
     <Route
       path="/teams"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Teams />
         </RequireRole>
       }
     />
     <Route path="/tasks" element={<Tasks />} />
     <Route path="/calendar" element={<Calendar />} />
     <Route path="/followups" element={<Followups />} />
     <Route path="/calls" element={<Calls />} />
     <Route path="/whatsapp-inbox" element={<WhatsappInbox />} />
     <Route path="/email-inbox" element={<EmailInbox />} />
     <Route
       path="/reports"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Reports />
         </RequireRole>
       }
     />
     <Route
       path="/analytics"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Analytics />
         </RequireRole>
       }
     />
     <Route path="/documents" element={<Documents />} />
     <Route
       path="/courses"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Courses />
         </RequireRole>
       }
     />
     <Route
       path="/courses/add"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <AddCourse />
         </RequireRole>
       }
     />
     <Route
       path="/courses/enrollments"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Enrollments />
         </RequireRole>
       }
     />
     <Route
       path="/courses/payments"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Payments />
         </RequireRole>
       }
     />
     <Route
       path="/courses/batches"
       element={
         <RequireRole roles={["admin", "manager"]}>
           <Batches />
         </RequireRole>
       }
     />
     <Route path="/notifications" element={<Notifications />} />
     <Route path="/profile" element={<Profile />} />
     <Route path="/settings" element={<Settings />} />

      </Route>

      {/* Any unknown/unmatched URL: send unauthenticated visitors to login,
          show a real 404 to logged-in users */}
      <Route
        path="*"
        element={
          token ? <NotFound /> : <Navigate to="/login" replace />
        }
      />
    </Routes>
    </ThemeProvider>
  );
}

export default App;
