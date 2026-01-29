// src/App.jsx

import { useEffect, useState } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { supabase } from "./services/supabase"

import Login from "./pages/login"
import Dashboard from "./pages/dashboard"
import CreateEvent from "./pages/CreateEvent"
import EventDetails from "./pages/EventDetails"
import AdminUsers from "./pages/AdminUsers"

function App() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        // 1️⃣ Get session ONCE
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("Session error:", sessionError)
          setLoading(false)
          return
        }

        if (!session?.user) {
          setUser(null)
          setRole(null)
          setLoading(false)
          return
        }

        setUser(session.user)

        // 2️⃣ Fetch role
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single()

        if (error) {
          console.error("Role fetch error:", error.message)
          setRole("student")
        } else {
          setRole(data.role)
        }

        setLoading(false)
      } catch (err) {
        console.error("Fatal auth error:", err)
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-beige p-6">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />

        <Route
          path="/"
          element={
            user ? (
              <Dashboard user={user} role={role} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/create"
          element={
            user && (role === "organizer" || role === "admin") ? (
              <CreateEvent user={user} role={role} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/event/:id"
          element={
            user ? (
              <EventDetails user={user} role={role} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        <Route
          path="/admin/users"
          element={
            user && role === "admin" ? (
              <AdminUsers />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
