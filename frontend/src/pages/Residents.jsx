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
    tetap: 'badge-green',
    kontrak: 'badge-amber',
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengelolaan Penghuni</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola data penghuni perumahan</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Penghuni
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header">Foto KTP</th>
              <th className="table-header">Nama Lengkap</th>
              <th className="table-header">Status Penghuni</th>
              <th className="table-header">No. Telepon</th>
              <th className="table-header">Status Pernikahan</th>
              <th className="table-header text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {residents.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400">Belum ada data penghuni</td></tr>
            )}
            {residents.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td className="table-cell">
                  {r.ktp_photo_url ? (
                    <img src={r.ktp_photo_url} alt="KTP" className="h-11 w-17 rounded-lg object-cover border border-slate-200 shadow-sm" />
                  ) : (
                    <span className="text-slate-300 text-xs">Tidak ada</span>
                  )}
                </td>
                <td className="table-cell font-medium text-slate-800">{r.full_name}</td>
                <td className="table-cell">
                  <span className={`capitalize ${statusBadge[r.resident_status]}`}>
                    {r.resident_status}
                  </span>
                </td>
                <td className="table-cell text-slate-600">{r.phone_number}</td>
                <td className="table-cell text-slate-600 capitalize">
                  {r.marital_status === 'sudah' ? 'Sudah Menikah' : 'Belum Menikah'}
                </td>
                <td className="table-cell text-right">
                  <button onClick={() => openEdit(r)} className="btn-secondary">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
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
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nama Lengkap</label>
            <input type="text" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Foto KTP (jpg/png, maks 2MB)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Pilih File
                <input type="file" accept="image/jpeg,image/png" onChange={handlePhoto} className="hidden" />
              </label>
            </div>
            {preview && <img src={preview} alt="Preview KTP" className="mt-2 h-28 rounded-xl object-cover border border-slate-200 shadow-sm" />}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Penghuni</label>
              <select value={form.resident_status} onChange={(e) => setForm({ ...form, resident_status: e.target.value })} className="input-select">
                <option value="tetap">Tetap</option>
                <option value="kontrak">Kontrak</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status Pernikahan</label>
              <select value={form.marital_status} onChange={(e) => setForm({ ...form, marital_status: e.target.value })} className="input-select">
                <option value="belum">Belum Menikah</option>
                <option value="sudah">Sudah Menikah</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Nomor Telepon</label>
            <input type="tel" value={form.phone_number} onChange={(e) => setForm({ ...form, phone_number: e.target.value })} required className="input-field" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>
    </div>
  )
}
