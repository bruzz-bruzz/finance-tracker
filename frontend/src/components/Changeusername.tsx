import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Toast from './Toast.tsx'
import Togglemode from './Togglemode.tsx'
import {useCookies} from 'react-cookie'
export default function Changeusername() {
  const { id } = useParams()
  const nav = useNavigate()
  const [username, setUsername] = useState('')
  const [confirm, setConfirm] = useState('')
  const [cookies, setCookie] = useCookies(['theme'])
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [password,setPassword] = useState('')
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus(null)
    if (!password || !username || !confirm) return setStatus({ ok: false, msg: 'Fill all fields' })
    if (username !== confirm) return setStatus({ ok: false, msg: 'Usernames do not match' })
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/changeCredentials`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({type:'username', userid: id, newUsername: username, password: password })
      })
      const data = await res.json()
      if (data === 'Success') {
        setStatus({ ok: true, msg: 'Username changed' })
        setTimeout(() => nav(`/dashboard/${id}`), 3000)
      } else {
        setStatus({ ok: false, msg: String(data || 'Unable to change username') })
      }
    } catch (err) {
      setStatus({ ok: false, msg: 'Network error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <Togglemode />
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-2 text-slate-800">Change Username</h2>
        <p className="text-sm text-slate-600 mb-6">Choose a new username for your account.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-600">New username</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border border-black mt-1 block w-full rounded-md border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-600">Confirm new username</span>
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="border border-black mt-1 block w-full rounded-md border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </label>
        <label className="block">
            <span className="text-sm text-slate-600">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-black mt-1 block w-full rounded-md border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-white font-semibold shadow disabled:opacity-60"
          >
            {loading ? 'Saving…' : 'Save username'}
          </button>
        </form>

        {status && (
          <div className={`mt-4 p-3 rounded-md text-sm ${status.ok ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
            {status.msg}
          </div>
        )}

        <div className="mt-4 text-sm text-slate-600">
          <button className="text-indigo-600 hover:underline" onClick={() => nav(-1)}>Back</button>
        </div>
      </div>
      {status && (
              <div>
                <Toast message={status.msg} type={status.ok}/>
              </div>
            )}
    </div>
  )
}