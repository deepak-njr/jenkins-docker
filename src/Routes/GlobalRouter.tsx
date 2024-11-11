import { Routes, Route, Navigate } from "react-router-dom";
import { GlobalLayout, ProtectedLayout, PageNotFound } from "@components/index";

import { protectRoutes, globalRoutes } from "./Routes";
import { ReactNode } from "react";
import { useHasAccess } from "@hooks/useHasAccess";
import { useAuth } from "~/Hooks/useAuth";
import { InactivityDetector } from "../Utils/InactivityDetector";
import { defaultRedirect } from "@utils/Constants";

export function GlobalRouter() {
  const { hasPermissions } = useHasAccess();
  const { user } = useAuth();
  const getElementwithAccess = (element: ReactNode, roles: string[]) => {
    if (!user || !user.access || !user.role) {
      return <Navigate to="/auth/login" />;
    } else {
      return hasPermissions(roles) ? (
        <InactivityDetector>{element}</InactivityDetector>
      ) : (
        <Navigate to="/unauthorized-entry" />
      );
    }
  };
  return (
    <Routes>
      {/* Replace this with error pages */}
      <Route
        path="*"
        element={<PageNotFound />}
      />
      <Route
        path="/"
        element={<Navigate to={defaultRedirect} />}
      />
      <Route element={<ProtectedLayout />}>
        {protectRoutes.map(({ path, element, roles }) => (
          <Route
            path={path}
            element={getElementwithAccess(element, roles)}
            key={path}
          />
        ))}
      </Route>
      <Route element={<GlobalLayout />}>
        {globalRoutes.map(({ path, element, ...res }) => (
          <Route
            path={path}
            {...res}
            element={
              user && user.role && ["/auth/login"].includes(path) ? (
                <Navigate to={user.role === "CLM_USER" ? "/clm/dashboard" : "/dashboard"} />
              ) : (
                element
              )
            }
            // element={element}
            key={path}
          />
        ))}
      </Route>
    </Routes>
  );
}
