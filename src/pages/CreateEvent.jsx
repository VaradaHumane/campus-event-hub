import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../services/supabase"

export default function CreateEvent({ user }) {
  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [type, setType] = useState("")
  const [date, setDate] = useState("")
  const [tasks, setTasks] = useState([])
  const [taskText, setTaskText] = useState("")
  const [loading, setLoading] = useState(false)

  const addTask = () => {
    if (!taskText.trim()) return
    setTasks([...tasks, taskText])
    setTaskText("")
  }

  const createEvent = async () => {
    if (!title || !type || !date) {
      alert("Fill all event fields")
      return
    }

    setLoading(true)

    // 1️⃣ Create event
    const { data: event, error } = await supabase
      .from("events")
      .insert({
        title,
        type,
        date,
        created_by: user.id,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      alert("Event creation failed")
      setLoading(false)
      return
    }

    // 2️⃣ Create tasks
    if (tasks.length > 0) {
      const rows = tasks.map(t => ({
        event_id: event.id,
        title: t,
        status: "pending",
      }))

      await supabase.from("tasks").insert(rows)
    }

    setLoading(false)
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-beige p-8">
      <h1 className="text-2xl font-semibold mb-6">
        Create Event
      </h1>

      <div className="max-w-xl space-y-4">
        <input
          className="w-full border p-3 rounded"
          placeholder="Event title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        <input
          className="w-full border p-3 rounded"
          placeholder="Event type"
          value={type}
          onChange={e => setType(e.target.value)}
        />

        <input
          type="date"
          className="w-full border p-3 rounded"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        {/* TASKS */}
        <div className="border rounded p-4 space-y-3">
          <h2 className="font-medium">Tasks</h2>

          <div className="flex gap-2">
            <input
              className="flex-1 border p-2 rounded"
              placeholder="Task description"
              value={taskText}
              onChange={e => setTaskText(e.target.value)}
            />
            <button
              onClick={addTask}
              className="bg-brown px-4 rounded"
            >
              Add
            </button>
          </div>

          <ul className="list-disc ml-5 text-sm">
            {tasks.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>

        <button
          onClick={createEvent}
          disabled={loading}
          className="bg-gold px-6 py-3 rounded-xl"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </div>
    </div>
  )
}
