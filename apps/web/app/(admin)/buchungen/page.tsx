import { createClient } from '@/lib/supabase/server'
import type { Database } from '@escape-tour/database/src/types/supabase'
import { BookingsTable } from './bookings-table'

type BookingRow = Database['public']['Tables']['bookings']['Row']

export default async function BookingsPage() {
 const supabase = await createClient()

 const { data, error } = await supabase
  .from('bookings')
  .select()
  .order('created_at', { ascending: false })

 const bookings = (data ?? []) as BookingRow[]

 if (error) {
  console.error('Bookings fetch error:', error)
 }

 return (
  <div>
   <div className="flex items-center justify-between mb-6">
    <h1 className="font-display text-2xl font-bold text-white">Buchungen</h1>
    <p className="text-sm text-dark-500">{bookings.length} Buchungen gesamt</p>
   </div>

   <BookingsTable bookings={bookings} />
  </div>
 )
}
