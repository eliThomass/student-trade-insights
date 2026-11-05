import { createBrowserRouter, Navigate, Outlet, ScrollRestoration } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { RequireActiveStudent, RequireMentor, RequirePendingStudent } from '@/auth/guards'
import { SessionProvider } from '@/auth/SessionProvider'
import { DemoSwitcher } from '@/components/DemoSwitcher'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { PublicLayout } from '@/components/layout/PublicLayout'
import { StudentLayout } from '@/components/layout/StudentLayout'
import { ToastProvider } from '@/components/ui/ToastProvider'
import ApplicationDetail from '@/pages/admin/ApplicationDetail'
import Applications from '@/pages/admin/Applications'
import Content from '@/pages/admin/Content'
import StudentDetail from '@/pages/admin/StudentDetail'
import Students from '@/pages/admin/Students'
import NotFound from '@/pages/NotFound'
import Apply from '@/pages/public/Apply'
import Landing from '@/pages/public/Landing'
import Login from '@/pages/public/Login'
import Status from '@/pages/public/Status'
import Learn from '@/pages/student/Learn'
import ModulePage from '@/pages/student/ModulePage'
import Resources from '@/pages/student/Resources'
import Sessions from '@/pages/student/Sessions'

function Root() {
  return (
    <ToastProvider>
      <SessionProvider>
        <Outlet />
        <DemoSwitcher />
        <ScrollRestoration />
      </SessionProvider>
    </ToastProvider>
  )
}

/** Route table from phase1-build-blueprint.md ("Routes"). */
const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/apply', element: <Apply /> },
          { path: '/login', element: <Login /> },
          { element: <RequirePendingStudent />, children: [{ path: '/status', element: <Status /> }] },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        element: <RequireActiveStudent />,
        children: [
          {
            element: <StudentLayout />,
            children: [
              { path: '/learn', element: <Learn /> },
              { path: '/learn/:slug', element: <ModulePage /> },
              { path: '/resources', element: <Resources /> },
              { path: '/sessions', element: <Sessions /> },
            ],
          },
        ],
      },
      {
        element: <RequireMentor />,
        children: [
          {
            path: '/admin',
            element: <AdminLayout />,
            children: [
              { index: true, element: <Navigate to="/admin/applications" replace /> },
              { path: 'applications', element: <Applications /> },
              { path: 'applications/:id', element: <ApplicationDetail /> },
              { path: 'students', element: <Students /> },
              { path: 'students/:id', element: <StudentDetail /> },
              { path: 'content', element: <Content /> },
            ],
          },
        ],
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
