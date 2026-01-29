// src/pages/AdminUsers.jsx

import { useEffect, useState } from "react"
import { supabase } from "../services/supabase"

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("profiles")
      .select("id, role")

    if (error) {
      console.error("Fetch users error:", error.message)
      setError("Permission denied or RLS blocking access.")
      setUsers([])
    } else {
      setUsers(data || [])
    }

    setLoading(false)
  }

  const updateRole = async (userId, newRole) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)

    if (error) {
      alert("You are not allowed to change roles.")
    } else {
      fetchUsers()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-beige p-8">
        <p>Loading users...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-beige p-8">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-beige p-8">
      <h1 className="text-2xl font-semibold mb-6">
        User Management
      </h1>

      <div className="bg-white border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-border text-left">
            <tr>
              <th className="p-4">User ID</th>
              <th className="p-4">Role</th>
              <th className="p-4">Change Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map(user => (
              <tr
                key={user.id}
                className="border-t border-border"
              >
                <td className="p-4 font-mono text-xs">
                  {user.id}
                </td>

                <td className="p-4 capitalize">
                  {user.role}
                </td>

                <td className="p-4">
                  <select
                    value={user.role}
                    onChange={e =>
                      updateRole(user.id, e.target.value)
                    }
                    className="border rounded px-2 py-1"
                  >
                    <option value="student">Student</option>
                    <option value="organizer">Organizer</option>
                    <option value="faculty">Faculty</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
