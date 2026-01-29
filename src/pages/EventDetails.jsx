import { useEffect, useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

export default function EventDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [event, setEvent] = useState(null)
  const [tasks, setTasks] = useState([])

  // Fetch event and tasks on load
  useEffect(() => {
    fetchEvent()
    fetchTasks()
  }, [])

  const fetchEvent = async () => {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single()

    setEvent(data)
  }

  const fetchTasks = async () => {
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("event_id", id)
      .order("created_at")

    setTasks(data || [])
  }

  // Update event status automatically
  const updateEventStatus = async (updatedTasks) => {
    const allDone =
      updatedTasks.length > 0 &&
      updatedTasks.every(task => task.status === "Done")

    await supabase
      .from("events")
      .update({
        status: allDone ? "Completed" : "Planning",
      })
      .eq("id", id)
  }

  // Toggle task status (live update)
  const toggleTask = async (taskId, status) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId
        ? {
            ...task,
            status: status === "Done" ? "Pending" : "Done",
          }
        : task
    )

    // Update UI immediately
    setTasks(updatedTasks)

    // Update database
    await supabase
      .from("tasks")
      .update({
        status: status === "Done" ? "Pending" : "Done",
      })
      .eq("id", taskId)

    updateEventStatus(updatedTasks)
  }

  // Delete event
  const deleteEvent = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this event?"
    )

    if (!confirmDelete) return

    await supabase.from("events").delete().eq("id", id)
    navigate("/")
  }

  if (!event) return null

  return (
    <div className="min-h-screen bg-beige">
      {/* HEADER */}
      <header className="border-b border-border bg-beige">
        <div className="max-w-5xl mx-auto px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-brown">
              {event.title}
            </h1>
            <p className="text-sm text-muted">
              Status: {event.status}
            </p>
          </div>

          <div className="flex gap-4 items-center">
            <Link
              to="/"
              className="text-sm text-brown hover:underline"
            >
              ← Back
            </Link>

            <button
              onClick={deleteEvent}
              className="text-sm text-red-600"
            >
              Delete Event
            </button>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        <h2 className="text-lg font-semibold mb-6 text-brown">
          Task Checklist
        </h2>

        <div className="space-y-4">
          {tasks.map(task => (
            <div
              key={task.id}
              className="flex items-center gap-4 bg-white border border-border rounded-2xl p-4"
            >
              <input
                type="checkbox"
                checked={task.status === "Done"}
                onChange={() =>
                  toggleTask(task.id, task.status)
                }
                className="accent-gold"
              />

              <span
                className={
                  task.status === "Done"
                    ? "line-through text-muted"
                    : ""
                }
              >
                {task.title}
              </span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
