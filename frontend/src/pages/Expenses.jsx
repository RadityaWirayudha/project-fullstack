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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pengeluaran Operasional</h1>
        <button
          onClick={openCreate}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Tambah Pengeluaran
        </button>
      </div>

      <div className="rounded-xl bg-white shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3">Kategori</th>
              <th className="px-4 py-3">Deskripsi</th>
              <th className="px-4 py-3 text-right">Jumlah</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Belum ada pengeluaran</td></tr>
            )}
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3">{formatDate(exp.expense_date)}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {exp.category}
                  </span>
                </td>
                <td className="px-4 py-3">{exp.description}</td>
                <td className="px-4 py-3 text-right font-medium">{formatRupiah(exp.amount)}</td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(exp)}
                    className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium hover:bg-slate-100 transition"
                  >
                    Ubah
                  </button>
                  <button
                    onClick={() => handleDelete(exp)}
                    className="rounded-lg border border-rose-200 text-rose-600 px-3 py-1.5 text-xs font-medium hover:bg-rose-50 transition"
                  >
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
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Deskripsi</label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              required
              placeholder="Contoh: Gaji satpam bulan Juli"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Kategori</label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                required
                placeholder="Gaji / Perbaikan / Kegiatan"
                list="expense-categories"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
              <datalist id="expense-categories">
                <option value="Gaji" />
                <option value="Perbaikan" />
                <option value="Kegiatan" />
                <option value="Lainnya" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
                min={1}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal</label>
            <input
              type="date"
              value={form.expense_date}
              onChange={(e) => setForm({ ...form, expense_date: e.target.value })}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
