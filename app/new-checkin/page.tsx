import { getAuthUser } from '@/lib/auth'
import NewCheckinForm from './NewCheckinForm'

export default async function NewCheckinPage() {
  const user = await getAuthUser()
  const displayName = user ? (user.name || user.email) : undefined
  return <NewCheckinForm userDisplay={displayName} />
}
