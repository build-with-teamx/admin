import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/app-layout"
import { AuthProvider } from "@/lib/auth"
import { PagesProvider, usePages } from "@/lib/pages"
import { IntegrationsPage } from "@/pages/integrations"
import { LlmSetupPage } from "@/pages/llm-setup"
import { LoginPage } from "@/pages/login"
import { OrganizationsPage } from "@/pages/organizations"
import { OverviewPage } from "@/pages/overview"
import { PageManagementPage } from "@/pages/page-management"
import { UsersPage } from "@/pages/users"

/** Sends visitors home when an optional page has been switched off. */
function Gate({ id, children }: { id: string; children: ReactNode }) {
  const { isEnabled } = usePages()
  return isEnabled(id) ? <>{children}</> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <PagesProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route
                path="organizations"
                element={
                  <Gate id="organizations">
                    <OrganizationsPage />
                  </Gate>
                }
              />
              <Route
                path="llm"
                element={
                  <Gate id="llm">
                    <LlmSetupPage />
                  </Gate>
                }
              />
              <Route path="integrations" element={<IntegrationsPage />} />
              <Route path="pages" element={<PageManagementPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PagesProvider>
    </AuthProvider>
  )
}
