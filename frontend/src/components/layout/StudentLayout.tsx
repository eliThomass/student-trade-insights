import { BookOpen, FolderOpen, NotebookPen } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { LibrarySearch } from '@/components/LibrarySearch'

export function StudentLayout() {
  return (
    <AppShell
      homeTo="/learn"
      nav={[
        { to: '/learn', label: 'Learn', icon: BookOpen },
        { to: '/resources', label: 'Resources', icon: FolderOpen },
        { to: '/sessions', label: 'Sessions', icon: NotebookPen },
      ]}
      topBar={<LibrarySearch />}
    />
  )
}
