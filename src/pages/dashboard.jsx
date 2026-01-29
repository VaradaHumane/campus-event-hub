import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../services/supabase"

export default function Dashboard({ user, role }) {
  const [events, setEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        type,
        date,
        status,
        tasks ( id, status )
      `
      )
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch events error:", error)
    } else {
      setEvents(data || [])
    }
  }

  // ✅ CORRECT progress calculation
  const getProgress = (tasks = []) => {
    if (tasks.length === 0) return 0
    const completed = tasks.filter(
      t => t.status === "completed"
    ).length
    return Math.round((completed / tasks.length) * 100)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-beige">
      {/* HEADER */}
      <header className="border-b border-border bg-beige">
        <div className="max-w-6xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-brown">
              Campus Event Hub
            </h1>
            <p className="text-sm text-muted">
              Logged in as: <b>{role}</b>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {(role === "organizer" || role === "admin") && (
              <Link
                to="/create"
                className="rounded-xl bg-brown text-black px-5 py-2.5"
              >
                + New Event
              </Link>
            )}

            <button
              onClick={handleLogout}
              className="rounded-xl border border-border px-4 py-2.5 text-muted hover:bg-white transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="max-w-6xl mx-auto px-8 py-10 space-y-6">
        {events.length === 0 ? (
          <p className="text-muted">
            No events yet. Create one to get started 🌱
          </p>
        ) : (
          events.map(event => {
            const progress = getProgress(event.tasks)

            return (
              <Link
                key={event.id}
                to={`/event/${event.id}`}
                className="block bg-white border border-border rounded-2xl p-6 hover:shadow-sm transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {event.title}
                    </h3>
                    <p className="text-sm text-muted">
                      {event.type} • {event.date}
                    </p>
                  </div>

                  <span className="text-sm capitalize text-gold">
                    {event.status}
                  </span>
                </div>

                {/* PROGRESS BAR */}
                <div className="w-full bg-border h-2 rounded-full">
                  <div
                    className="bg-gold h-2 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <p className="text-xs text-muted mt-2">
                  {progress}% completed
                </p>
              </Link>
            )
          })
        )}
      </main>
    </div>
  )
}
