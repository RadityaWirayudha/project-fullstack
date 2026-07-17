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
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengelolaan Rumah</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data rumah dan status penghuni</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Rumah
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {houses.length === 0 && (
          <div className="col-span-full card p-12 text-center text-slate-400">Belum ada data rumah</div>
        )}
        {houses.map((h) => (
          <div
            key={h.id}
            className="card p-5 hover:shadow-md transition-all duration-200 group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${
                  h.status === 'dihuni' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                }`}>
                  {h.house_number?.split('-')[1] || h.house_number}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">Rumah {h.house_number}</h3>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium mt-1 ${
                    h.status === 'dihuni' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {h.status === 'dihuni' ? 'Dihuni' : 'Tidak Dihuni'}
                  </span>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 mb-1">Penghuni Saat Ini</p>
              <p className="text-sm font-medium text-slate-700">
                {h.current_occupancy?.resident?.full_name || (
                  <span className="text-slate-300 font-normal">-</span>
                )}
              </p>
            </div>
            <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => openEdit(h)}
                className="btn-secondary flex-1"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Ubah
              </button>
              <Link
                to={`/houses/${h.id}`}
                className="btn-primary flex-1 justify-center"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Detail
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} title={editing ? 'Ubah Rumah' : 'Tambah Rumah'} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Rumah</label>
            <input
              type="text"
              value={houseNumber}
              onChange={(e) => setHouseNumber(e.target.value)}
              required
              placeholder="Contoh: A-09"
              className="input-field"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
