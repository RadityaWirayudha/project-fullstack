import { useEffect, useState } from 'react'
import api from '../lib/api'
import Modal from '../components/Modal'

const emptyForm = {
  full_name: '',
  resident_status: 'tetap',
  phone_number: '',
  marital_status: 'belum',
}

export default function Residents() {
  const [residents, setResidents] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [photo, setPhoto] = useState(null)
  const [preview, setPreview] = useState(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/residents').then(({ data }) => setResidents(data))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setPhoto(null)
    setPreview(null)
    setError('')
    setModalOpen(true)
  }

  function openEdit(resident) {
    setEditing(resident)
    setForm({
      full_name: resident.full_name,
      resident_status: resident.resident_status,
      phone_number: resident.phone_number,
      marital_status: resident.marital_status,
    })
    setPhoto(null)
    setPreview(resident.ktp_photo_url)
    setError('')
    setModalOpen(true)
  }

  function handlePhoto(e) {
    const file = e.target.files[0]
    setPhoto(file || null)
    setPreview(file ? URL.createObjectURL(file) : editing?.ktp_photo_url || null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const fd = new FormData()
    Object.entries(form).forEach(([key, value]) => fd.append(key, value))
    if (photo) fd.append('ktp_photo', photo)
    if (editing) fd.append('_method', 'PUT')

    try {
      await api.post(editing ? `/residents/${editing.id}` : '/residents', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data.')
    } finally {
      setSaving(false)
    }
  }

  const statusBadge = {
    tetap: 'bg-emerald-100 text-emerald-700',
    kontrak: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengelolaan Penghuni</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Tambah Penghuni
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Foto KTP</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">Status Penghuni</th>
              <th className="px-4 py-3">No. Telepon</th>
              <th className="px-4 py-3">Status Pernikahan</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">Belum ada data penghuni</td></tr>
            )}
            {residents.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">
                  {r.ktp_photo_url ? (
                    <img src={r.ktp_photo_url} alt="KTP" className="h-10 w-16 rounded object-cover border" />
                  ) : (
                    <span className="text-slate-300 text-xs">Tidak ada</span>
                  )}
                </td>
                <td className="px-4 py-3 font-medium">{r.full_name}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${statusBadge[r.resident_status]}`}>
                    {r.resident_status}
                  </span>
                </td>
                <td className="px-4 py-3">{r.phone_number}</td>
                <td className="px-4 py-3 capitalize">{r.marital_status === 'sudah' ? 'Sudah Menikah' : 'Belum Menikah'}</td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => openEdit(r)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition"
                  >
                    Ubah
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Ubah Penghuni' : 'Tambah Penghuni'} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nama Lengkap</label>
            <input
              type="text"
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Foto KTP (jpg/png, maks 2MB)</label>
            <input type="file" accept="image/jpeg,image/png" onChange={handlePhoto} className="w-full text-sm" />
            {preview && <img src={preview} alt="Preview KTP" className="mt-2 h-24 rounded-lg object-cover border" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status Penghuni</label>
              <select
                value={form.resident_status}
                onChange={(e) => setForm({ ...form, resident_status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="tetap">Tetap</option>
                <option value="kontrak">Kontrak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status Pernikahan</label>
              <select
                value={form.marital_status}
                onChange={(e) => setForm({ ...form, marital_status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white"
              >
                <option value="belum">Belum Menikah</option>
                <option value="sudah">Sudah Menikah</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nomor Telepon</label>
            <input
              type="tel"
              value={form.phone_number}
              onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
              required
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
