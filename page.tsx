import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul className="divide-y divide-zinc-200">
      {todos?.map((todo) => (
        <li key={todo.id} className="p-4">{todo.name}</li>
      ))}
    </ul>
  )
}
