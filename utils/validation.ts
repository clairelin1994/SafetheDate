import { z } from 'zod'

export const emailSchema = z.string().email('Invalid email address').toLowerCase()

export const loginSchema = z.object({
  email: emailSchema,
})

export const checkinSchema = z.object({
  location: z.string().max(200).optional(),
  withWhom: z.string().max(100).optional(),
  activityDescription: z.string().max(500).optional(),
  deadline: z.string().refine((val) => {
    const d = new Date(val)
    return !isNaN(d.getTime()) && d > new Date()
  }, 'Deadline must be a valid future date'),
  emergencyContacts: z
    .array(emailSchema)
    .min(1, 'At least one emergency contact is required')
    .max(3, 'Maximum 3 emergency contacts'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type CheckinInput = z.infer<typeof checkinSchema>
