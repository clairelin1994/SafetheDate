/**
 * /signup redirects to /login — both do "find or create user by email"
 * so there's no separate sign-up flow needed.
 */
import { redirect } from 'next/navigation'

export default function SignupPage() {
  redirect('/login')
}
