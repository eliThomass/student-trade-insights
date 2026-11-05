/** Demo accounts for the "View as" switcher and the mock login page. */
export interface Persona {
  label: string
  description: string
  /** null = logged out. */
  profileId: string | null
}

export const personas: Persona[] = [
  { label: 'Visitor', description: 'Not logged in', profileId: null },
  { label: 'Applicant', description: 'Applied, waiting on a decision', profileId: 'u-a01' },
  { label: 'Waitlisted', description: 'Applied and waitlisted', profileId: 'u-a09' },
  { label: 'Approved', description: 'Approved, payment not confirmed yet', profileId: 'u-a12' },
  { label: 'Student', description: 'Active student with session notes', profileId: 'u-s01' },
  { label: 'Mentor', description: 'Admin: applications, students, content', profileId: 'u-mentor' },
]
