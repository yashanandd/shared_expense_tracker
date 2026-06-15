import { useState } from 'react'
import { Modal, Button, Input } from '../ui'

const categories = [
  { value: 'housing', label: 'Housing' },
  { value: 'travel', label: 'Travel' },
  { value: 'food', label: 'Food & Dining' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'other', label: 'Other' },
]

export default function AddGroupModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
  })
  const [errors, setErrors] = useState({})

  function validate() {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Group name is required'
    if (!form.description.trim()) errs.description = 'Description is required'
    if (!form.category) errs.category = 'Select a category'
    return errs
  }

  function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) {
      setErrors(errs)
      return
    }
    onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      category: form.category,
      memberCount: 1,
      totalExpenses: 0,
    })
    setForm({ name: '', description: '', category: '' })
    setErrors({})
  }

  function handleClose() {
    setForm({ name: '', description: '', category: '' })
    setErrors({})
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create Group"
      description="Start a new expense sharing group."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          placeholder="e.g. Roommates, Road Trip"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value })
            if (errors.name) setErrors({ ...errors, name: undefined })
          }}
          error={errors.name}
        />
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Description
          </label>
          <textarea
            placeholder="What is this group for?"
            rows={3}
            value={form.description}
            onChange={(e) => {
              setForm({ ...form, description: e.target.value })
              if (errors.description) setErrors({ ...errors, description: undefined })
            }}
            className={`h-24 w-full rounded-[var(--radius-md)] border bg-white px-3 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] transition-base focus-ring resize-none ${
              errors.description
                ? 'border-[var(--color-danger)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            }`}
          />
          {errors.description && (
            <p className="text-xs text-[var(--color-danger)]">{errors.description}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[var(--color-text)]">
            Category
          </label>
          <select
            value={form.category}
            onChange={(e) => {
              setForm({ ...form, category: e.target.value })
              if (errors.category) setErrors({ ...errors, category: undefined })
            }}
            className={`h-10 w-full appearance-none rounded-[var(--radius-md)] border bg-white px-3 pr-10 text-sm text-[var(--color-text)] transition-base focus-ring ${
              errors.category
                ? 'border-[var(--color-danger)]'
                : 'border-[var(--color-border)] hover:border-[var(--color-text-muted)]'
            }`}
          >
            <option value="" disabled>Select a category</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          {errors.category && (
            <p className="text-xs text-[var(--color-danger)]">{errors.category}</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit">Create Group</Button>
        </div>
      </form>
    </Modal>
  )
}
