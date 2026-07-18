/* eslint-disable no-unused-vars */
import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Courses from "./Pages/Courses/Courses.js";
import SignUp from "./Pages/SignUp/SignUp";
import Login from "./components/Login/Login";
import Dashboard from "./components/Dashboard/dashboard";
import AddData from "./components/AddData/AddData";
import EditData from "./components/Edit/EditData";
import Privacypolicy from "./Pages/privacypolicy/Privacypolicy.jsx";
import Termsandconditions from "./Pages/TermsAndConditions/Terms.jsx";
import Premium from "./Pages/Premium/Premium.jsx";
import { checkNotesAuthLoader } from "./utils/auth.js";
import { requireStudentAuthLoader } from "./utils/studentAuth.js";
import PremiumModulesPage from "./Pages/PremiumModules/PremiumModulesPage.jsx";
import ModulePage from "./Pages/PremiumModules/ModulePage/ModulePage.jsx";
import LoginPage from "./Pages/PremiumModules/Auth/LoginPage.jsx";
import SignupPage from "./Pages/PremiumModules/Auth/SignupPage.jsx";
import CheckEmailPage from "./Pages/PremiumModules/Auth/CheckEmailPage.jsx";
import VerifyEmailPage from "./Pages/PremiumModules/Auth/VerifyEmailPage.jsx";
import OrdersPage from "./Pages/PremiumModules/Orders/OrdersPage.jsx";
import ProfilePage from "./Pages/PremiumModules/Profile/ProfilePage.jsx";
import { wakeBackend } from "./utils/modules.js";

// Wake Render free tier as soon as app boots (reduces cold-start wait later)
wakeBackend();

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <PremiumModulesPage />,
    },
    {
      path: "/login",
      element: <LoginPage />,
    },
    {
      path: "/signup",
      element: <SignupPage />,
    },
    {
      path: "/check-email",
      element: <CheckEmailPage />,
    },
    {
      path: "/verify-email",
      element: <VerifyEmailPage />,
    },
    {
      path: "/orders",
      element: <OrdersPage />,
      loader: requireStudentAuthLoader,
    },
    {
      path: "/profile",
      element: <ProfilePage />,
      loader: requireStudentAuthLoader,
    },
    {
      path: "/courses",
      element: <Courses />,
      loader: requireStudentAuthLoader,
    },
    {
      path: "/signup9875",
      element: <SignUp />,
    },
    {
      path: "/noteslogin",
      element: <Login />,
    },
    {
      path: "/noteslogin/dashboard",
      element: <Dashboard />,
      loader: checkNotesAuthLoader,
    },
    {
      path: "/noteslogin/dashboard/add-data",
      element: <AddData />,
      loader: checkNotesAuthLoader,
    },
    {
      path: "/noteslogin/dashboard/edit-data/:id",
      element: <EditData />,
      loader: checkNotesAuthLoader,
    },
    {
      path: "/privacypolicy",
      element: <Privacypolicy />,
    },
    {
      path: "/terms",
      element: <Termsandconditions />,
    },
    {
      path: "/premium",
      element: <Premium />,
    },
    {
      path: "/premium-modules/:repoId/:moduleSlug",
      element: <ModulePage />,
    },
  ]);

  return (
    <div className="App">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
