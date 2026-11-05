import { Inbox, LayoutList, Users } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { listApplications } from '@/data/api'
import { useQuery } from '@/data/useQuery'

export function AdminLayout() {
  const { data } = useQuery('admin-nav-applications', listApplications)
  const pending = data?.filter((a) => a.decision === 'pending').length

  return (
    <AppShell
      homeTo="/admin/applications"
      area="Mentor"
      nav={[
        { to: '/admin/applications', label: 'Applications', icon: Inbox, count: pending },
        { to: '/admin/students', label: 'Students', icon: Users },
        { to: '/admin/content', label: 'Content', icon: LayoutList },
      ]}
    />
  )
}
