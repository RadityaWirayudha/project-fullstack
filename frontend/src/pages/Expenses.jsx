import { useEffect, useState } from 'react'
import api from '../lib/api'
import Modal from '../components/Modal'
import { formatRupiah, formatDate } from '../lib/format'

const today = new Date().toISOString().slice(0, 10)
const emptyForm = { description: '', category: '', amount: '', expense_date: today }

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function load() {
    api.get('/expenses').then(({ data }) => setExpenses(data))
  }

  useEffect(load, [])

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setModalOpen(true)
  }

  function openEdit(expense) {
    setEditing(expense)
    setForm({
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      expense_date: expense.expense_date,
    })
    setError('')
    setModalOpen(true)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, form)
      } else {
        await api.post('/expenses', form)
      }
      setModalOpen(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan pengeluaran.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(expense) {
    if (!confirm(`Hapus pengeluaran "${expense.description}"?`)) return
    await api.delete(`/expenses/${expense.id}`)
    load()
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Pengeluaran Operasional</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola pengeluaran perumahan</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah Pengeluaran
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="table-header">Tanggal</th>
              <th className="table-header">Kategori</th>
              <th className="table-header">Deskripsi</th>
              <th className="table-header text-right">Jumlah</th>
              <th className="table-header text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-12 text-center text-slate-400">Belum ada pengeluaran</td></tr>
            )}
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors">
                <td className="table-cell text-slate-600">{formatDate(exp.expense_date)}</td>
                <td className="table-cell">
                  <span className="badge-slate">{exp.category}</span>
                </td>
                <td className="table-cell text-slate-700">{exp.description}</td>
                <td className="table-cell text-right font-medium text-rose-600">{formatRupiah(exp.amount)}</td>
                <td className="table-cell text-right space-x-1.5">
                  <button onClick={() => openEdit(exp)} className="btn-secondary">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Ubah
                  </button>
                  <button onClick={() => handleDelete(exp)} className="btn-ghost-danger">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title={editing ? 'Ubah Pengeluaran' : 'Tambah Pengeluaran'} onClose={() => setModalOpen(false)}>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="Contoh: Gaji satpam bulan Juli"
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                placeholder="Gaji / Perbaikan / Kegiatan"
                list="expense-categories"
                className="input-field"
              />
              <datalist id="expense-categories">
                <option value="Gaji" />
                <option value="Perbaikan" />
                <option value="Kegiatan" />
                <option value="Lainnya" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Jumlah (Rp)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min={1}
                className="input-field"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              required
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
