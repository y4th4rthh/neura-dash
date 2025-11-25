"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Users,
  MessageCircle,
  Trash2,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  LayoutDashboard,
} from "lucide-react"
import "./App.css"

interface AdminUser {
  _id: string
  user_id: string
  chat_count: number
  last_activity: string | null
}

interface Analytics {
  total_users: number
  total_chats: number
  chats_by_model: { model: string; count: number }[]
  daily_activity: { date: string; count: number }[]
  top_users: { user_id: string; chat_count: number }[]
}

const API_BASE_URL = "https://voice-assistant-ai-adnm.onrender.com"

const colors = ["#FF8C00", "#FF9F1C", "#FFB84D", "#FFA500", "#FF7F00"]

const LoginPage: React.FC<{ onLogin: (userId: string) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`${API_BASE_URL}/users/admin-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: username,
          password: password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.user_id) {
        onLogin(data.user_id)
      } else {
        throw new Error(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500 rounded-full opacity-5 blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600 rounded-full opacity-5 blur-3xl"></div>

      <div className="max-w-md w-full relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-zinc-900 border border-orange-500 border-opacity-30 rounded-xl shadow-2xl p-8 backdrop-blur-sm"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg mb-4 shadow-lg">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-zinc-400 mt-2">Sign in to access your analytics</p>
          </div>

          <div className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-zinc-300 mb-2">
                Username
              </label>
              <div className="relative">
                <LayoutDashboard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your username"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-zinc-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-5 w-5" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  className="w-full pl-10 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-lg py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-3 rounded-lg transition-all font-semibold shadow-lg hover:shadow-orange-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Sign In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const Dashboard: React.FC<{ currentUser: string; onLogout: () => void }> = ({ currentUser, onLogout }) => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<"analytics" | "users">("analytics")
  const [searchTerm, setSearchTerm] = useState("")
  const [pagination, setPagination] = useState({ skip: 0, limit: 50, total: 0 })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }
  }, [activeTab, pagination.skip])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/analytics/`)
      const data = await response.json()
      setAnalytics(data)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/users/?skip=${pagination.skip}&limit=${pagination.limit}`)
      const data = await response.json()
      setUsers(data.users)
      setPagination((prev) => ({ ...prev, total: data.total }))
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteUser = async (userId: string) => {
    if (!confirm(`Are you sure you want to delete user ${userId} and all their chats?`)) return

    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.user_id !== userId))
        alert("User deleted successfully")
      } else {
        alert("Error deleting user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    }
  }

  const filteredUsers = users.filter((user) => user.user_id.toLowerCase().includes(searchTerm.toLowerCase()))

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const handlePrevPage = () => {
    setPagination((prev) => ({
      ...prev,
      skip: Math.max(0, prev.skip - prev.limit),
    }))
  }

  const handleNextPage = () => {
    setPagination((prev) => ({
      ...prev,
      skip: prev.skip + prev.limit,
    }))
  }

  const renderPagination = () => {
    const currentPage = Math.floor(pagination.skip / pagination.limit) + 1
    const totalPages = Math.ceil(pagination.total / pagination.limit)

    return (
      <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-700 bg-zinc-900">
        <div className="text-sm text-zinc-400">
          Showing <span className="font-semibold text-zinc-200">{pagination.skip + 1}</span> to{" "}
          <span className="font-semibold text-zinc-200">
            {Math.min(pagination.skip + pagination.limit, pagination.total)}
          </span>{" "}
          of <span className="font-semibold text-zinc-200">{pagination.total}</span> results
        </div>
        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={pagination.skip === 0}
            className="flex items-center px-3 py-1.5 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm font-medium">
            {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={pagination.skip + pagination.limit >= pagination.total}
            className="flex items-center px-3 py-1.5 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-orange-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-orange-500 hover:border-opacity-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
              <Users className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-400">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{analytics?.total_users || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-orange-500 hover:border-opacity-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-orange-600 bg-opacity-20 rounded-lg">
              <MessageCircle className="h-6 w-6 text-orange-300" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-400">Total Chats</p>
              <p className="text-3xl font-bold text-white mt-1">{analytics?.total_chats || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg hover:border-orange-500 hover:border-opacity-50 transition-colors">
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 bg-opacity-20 rounded-lg">
              <BarChart className="h-6 w-6 text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-zinc-400">Avg Chats/User</p>
              <p className="text-3xl font-bold text-white mt-1">
                {analytics ? Math.round(analytics.total_chats / Math.max(analytics.total_users, 1)) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Daily Activity</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={analytics?.daily_activity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="date" stroke="#71717a" style={{ fontSize: "12px" }} />
              <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
              <Line type="monotone" dataKey="count" stroke="#FF8C00" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4">Chats by Model</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={analytics?.chats_by_model}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ model, percent }: any) => {
                  let displayName = model
                  if (model === "gemini" || model === "neura.essence1.o") {
                    displayName = "neura.essence1.o"
                  } else if (model === "groq") {
                    displayName = "neura.swift1.o"
                  } else {
                    displayName = model
                  }
                  return `${displayName} ${(percent * 100).toFixed(0)}%`
                }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics?.chats_by_model.map((_: any, index: any) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#18181b",
                  border: "1px solid #3f3f46",
                  borderRadius: "8px",
                  color: "#fafafa",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold text-white mb-4">Top Active Users</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={analytics?.top_users}>
            <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
            <XAxis dataKey="user_id" stroke="#71717a" style={{ fontSize: "12px" }} />
            <YAxis stroke="#71717a" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fafafa",
              }}
            />
            <Bar dataKey="chat_count" fill="#FF8C00" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Users Management</h2>
        <button
          onClick={fetchUsers}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 h-4 w-4" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-zinc-700">
            <thead className="bg-zinc-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  User ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Chat Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Last Activity
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-black divide-y divide-zinc-700">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-zinc-900 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{user.user_id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-300">{user.chat_count}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-zinc-400">
                      {user.last_activity ? formatDate(user.last_activity) : "No activity"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => deleteUser(user.user_id)}
                      disabled={user.user_id === "admin"}
                      className={`inline-flex items-center px-3 py-1.5 rounded-lg transition-all ${user.user_id === "admin" ? "opacity-40 cursor-not-allowed text-zinc-500" : "text-red-400 hover:bg-red-500 hover:bg-opacity-10 hover:text-red-300"}`}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPagination()}
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-zinc-950 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            <span className="text-orange-500">Admin</span> Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Welcome, {currentUser}</span>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-zinc-300 hover:text-orange-400 transition-colors hover:bg-zinc-800 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex gap-4 mb-8 border-b border-zinc-800">
          <button
            onClick={() => setActiveTab("analytics")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "analytics"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-400 hover:text-orange-400"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`pb-4 px-2 font-semibold transition-colors ${
              activeTab === "users"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-zinc-400 hover:text-orange-400"
            }`}
          >
            Users
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center min-h-96">
            <div className="text-zinc-400">Loading...</div>
          </div>
        )}
        {!loading && (activeTab === "analytics" ? renderAnalytics() : renderUsers())}
      </div>
    </div>
  )
}

interface AppState {
  isLoggedIn: boolean
  currentUser: string
}

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>({ isLoggedIn: false, currentUser: "" })

  const handleLogin = (userId: string) => {
    setAppState({ isLoggedIn: true, currentUser: userId })
  }

  const handleLogout = () => {
    setAppState({ isLoggedIn: false, currentUser: "" })
  }

  return appState.isLoggedIn ? (
    <Dashboard currentUser={appState.currentUser} onLogout={handleLogout} />
  ) : (
    <LoginPage onLogin={handleLogin} />
  )
}

export default App
