import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../lib/api'
import Modal from '../components/Modal'

export default function Houses() {
  const [houses, setHouses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [houseNumber, setHouseNumber] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/houses').then(({ data }) => setHouses(data))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setHouseNumber('')
    setError('')
    setModalOpen(true)
  }

  function openEdit(house) {
    setEditing(house)
    setHouseNumber(house.house_number)
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/houses/${editing.id}`, { house_number: houseNumber })
      } else {
        await api.post('/houses', { house_number: houseNumber })
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengelolaan Rumah</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Tambah Rumah
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Nomor Rumah</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Penghuni Saat Ini</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {houses.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-400">Belum ada data rumah</td></tr>
            )}
            {houses.map((h) => (
              <tr key={h.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-medium">{h.house_number}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      h.status === 'dihuni' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {h.status === 'dihuni' ? 'Dihuni' : 'Tidak Dihuni'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {h.current_occupancy?.resident?.full_name || <span className="text-slate-300">-</span>}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(h)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition"
                  >
                    Ubah
                  </button>
                  <Link
                    to={`/houses/${h.id}`}
                    className="inline-block rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Ubah Rumah' : 'Tambah Rumah'} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Rumah</label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              required
              placeholder="Contoh: A-09"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
