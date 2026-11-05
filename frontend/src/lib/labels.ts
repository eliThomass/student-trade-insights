import type { Tone } from '@/components/ui/tone'
import type { Decision, ProfileStatus, ResourceType } from '@/types/db'

export const statusTone: Record<ProfileStatus, Tone> = {
  applicant: 'hold',
  approved: 'accent',
  active: 'up',
  waitlisted: 'hold',
  rejected: 'down',
  inactive: 'neutral',
}

export const statusLabel: Record<ProfileStatus, string> = {
  applicant: 'Applicant',
  approved: 'Approved, awaiting payment',
  active: 'Active',
  waitlisted: 'Waitlisted',
  rejected: 'Not accepted',
  inactive: 'Inactive',
}

export const decisionTone: Record<Decision, Tone> = {
  pending: 'hold',
  approved: 'up',
  waitlisted: 'hold',
  rejected: 'down',
}

export const decisionLabel: Record<Decision, string> = {
  pending: 'Pending',
  approved: 'Approved',
  waitlisted: 'Waitlisted',
  rejected: 'Rejected',
}

export const resourceTypeLabel: Record<ResourceType, string> = {
  pdf: 'PDF',
  link: 'Link',
  indicator: 'Indicator',
}
