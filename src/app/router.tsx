import { createBrowserRouter } from "react-router-dom"

import { AdminLayout } from "@/components/layout/admin-layout"
import { ResidentLayout } from "@/components/layout/resident-layout"

import { HomeRedirect } from "@/features/auth/home-redirect"
import { LoginPage } from "@/features/auth/login-page"
import { ProtectedRoute } from "@/features/auth/protected-route"
import { ForgotPasswordPage } from "@/features/auth/forgot-password-page"
import { ResetPasswordPage } from "@/features/auth/reset-password-page"

import { DashboardPage } from "@/features/dashboard/dashboard-page"

import { PuroksPage } from "@/features/puroks/puroks-page"
import { HouseholdsPage } from "@/features/households/households-page"
import { ResidentsPage } from "@/features/residents/residents-page"
import { OfficialsPage } from "@/features/officials/officials-page"
import { CommitteesPage } from "@/features/committees/committees-page"

import { AnnouncementsPage } from "@/features/announcements/announcements-page"

import { CertificatesPage } from "@/features/certificates/certificates-page"
import { CertificateVerificationPage } from "@/features/certificates/certificate-verification-page"

import { BlotterPage } from "@/features/blotter/blotter-page"

import { ReportsPage } from "@/features/reports/reports-page"

import { UsersPage } from "@/features/users/users-page"

import { SettingsPage } from "@/features/settings/settings-page"

import { ActivityLogsPage } from "@/features/activity-logs/activity-logs-page"

import { ResidentPortalDashboardPage } from "@/features/resident-portal/resident-dashboard-page"
import { ResidentProfilePage } from "@/features/resident-portal/resident-profile-page"
import { ResidentCertificatesPage } from "@/features/resident-portal/resident-certificates-page"
import { ResidentAnnouncementsPage } from "@/features/resident-portal/resident-announcements-page"

export const router =
  createBrowserRouter([
    // ========================================
    // PUBLIC ROUTES
    // ========================================

    {
      path: "/",
      element: (
        <HomeRedirect />
      ),
    },

    {
      path: "/login",
      element: (
        <LoginPage />
      ),
    },

    {
      path: "/forgot-password",
      element: (
        <ForgotPasswordPage />
      ),
    },

    {
      path: "/reset-password",
      element: (
        <ResetPasswordPage />
      ),
    },

    {
      path: "/verify/:token",
      element: (
        <CertificateVerificationPage />
      ),
    },

    // ========================================
    // ADMIN / BARANGAY STAFF
    // ========================================

    {
      element: (
        <ProtectedRoute
          allowedRoles={[
            "super_admin",
            "barangay_staff",
          ]}
        >
          <AdminLayout />
        </ProtectedRoute>
      ),

      children: [
        // ====================================
        // DASHBOARD
        // ====================================

        {
          path: "/dashboard",
          element: (
            <DashboardPage />
          ),
        },

        // ====================================
        // RESIDENTS
        // ====================================

        {
          path: "/residents",
          element: (
            <ResidentsPage />
          ),
        },

        // ====================================
        // HOUSEHOLDS
        // ====================================

        {
          path: "/households",
          element: (
            <HouseholdsPage />
          ),
        },

        // ====================================
        // PUROKS
        // ====================================

        {
          path: "/puroks",
          element: (
            <PuroksPage />
          ),
        },

        // ====================================
        // OFFICIALS
        // ====================================

        {
          path: "/officials",
          element: (
            <OfficialsPage />
          ),
        },

        // ====================================
        // COMMITTEES
        // ====================================

        {
          path: "/committees",
          element: (
            <CommitteesPage />
          ),
        },

        // ====================================
        // CERTIFICATES
        // ====================================

        {
          path: "/certificates",
          element: (
            <CertificatesPage />
          ),
        },

        // ====================================
        // BLOTTER
        // ====================================

        {
          path: "/blotter",
          element: (
            <BlotterPage />
          ),
        },

        // ====================================
        // ANNOUNCEMENTS
        // ====================================

        {
          path: "/announcements",
          element: (
            <AnnouncementsPage />
          ),
        },

        // ====================================
        // REPORTS
        // ====================================

        {
          path: "/reports",
          element: (
            <ReportsPage />
          ),
        },

        // ====================================
        // SUPER ADMIN ONLY
        // ====================================

        {
          path: "/users",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
              ]}
            >
              <UsersPage />
            </ProtectedRoute>
          ),
        },

        {
          path: "/activity-logs",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
              ]}
            >
              <ActivityLogsPage />
            </ProtectedRoute>
          ),
        },

        {
          path: "/settings",
          element: (
            <ProtectedRoute
              allowedRoles={[
                "super_admin",
              ]}
            >
              <SettingsPage />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // ========================================
    // RESIDENT PORTAL
    // ========================================

    {
      element: (
        <ProtectedRoute
          allowedRoles={[
            "resident",
          ]}
        >
          <ResidentLayout />
        </ProtectedRoute>
      ),

      children: [
        // ====================================
        // RESIDENT DASHBOARD
        // ====================================

        {
          path: "/resident/dashboard",
          element: (
            <ResidentPortalDashboardPage />
          ),
        },

        // ====================================
        // MY PROFILE
        // ====================================

        {
          path: "/resident/profile",
          element: (
            <ResidentProfilePage />
          ),
        },

        // ====================================
        // MY CERTIFICATES
        // ====================================

        {
          path: "/resident/certificates",
          element: (
            <ResidentCertificatesPage />
          ),
        },

        // ====================================
        // RESIDENT ANNOUNCEMENTS
        // ====================================

        {
          path: "/resident/announcements",
          element: (
            <ResidentAnnouncementsPage />
          ),
        },
      ],
    },
  ])