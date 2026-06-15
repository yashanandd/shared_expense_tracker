import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { HiOutlineUserGroup, HiOutlinePlus } from 'react-icons/hi2'
import { PageHeader, Button, EmptyState } from '../components/ui'
import { GroupCard, AddGroupModal, GroupCardSkeleton } from '../components/groups'
import { getGroups, createGroup as apiCreateGroup, updateGroup as apiUpdateGroup, deleteGroup as apiDeleteGroup } from '../services/service'

export default function Groups() {
  const navigate = useNavigate()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await getGroups()
      setGroups(res.data.items)
    } catch (err) {
      setError(err.message || 'Failed to load groups')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function handleView(group) {
    navigate(`/groups/${group.id}`)
  }

  async function handleEdit(group) {
    const newName = prompt('New name:', group.name)
    if (newName && newName.trim()) {
      try {
        await apiUpdateGroup(group.id, { name: newName.trim(), description: group.description })
        setGroups((prev) =>
          prev.map((g) => (g.id === group.id ? { ...g, name: newName.trim() } : g)),
        )
      } catch (err) {
        alert(err.message || 'Failed to update group')
      }
    }
  }

  async function handleDelete(group) {
    if (confirm(`Delete "${group.name}"?`)) {
      try {
        await apiDeleteGroup(group.id)
        setGroups((prev) => prev.filter((g) => g.id !== group.id))
      } catch (err) {
        alert(err.message || 'Failed to delete group')
      }
    }
  }

  async function handleCreate(data) {
    try {
      const res = await apiCreateGroup(data)
      setGroups((prev) => [res.data, ...prev])
      setModalOpen(false)
    } catch (err) {
      alert(err.message || 'Failed to create group')
    }
  }


  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Groups"
          description="Manage your expense sharing groups."
          actions={
            <Button disabled>
              <HiOutlinePlus className="h-4 w-4" />
              New Group
            </Button>
          }
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <GroupCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Groups" description="Manage your expense sharing groups." />
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-base font-semibold text-[var(--color-text)]">Failed to load groups</p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">{error}</p>
          <Button className="mt-6" onClick={load}>Retry</Button>
        </div>
      </div>
    )
  }

  if (!groups.length) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Groups"
          description="Manage your expense sharing groups."
          actions={
            <Button onClick={() => setModalOpen(true)}>
              <HiOutlinePlus className="h-4 w-4" />
              New Group
            </Button>
          }
        />
        <EmptyState
          icon={HiOutlineUserGroup}
          title="No groups yet"
          description="Create your first group to start tracking shared expenses with friends, family, or colleagues."
          action={
            <Button onClick={() => setModalOpen(true)}>
              <HiOutlinePlus className="h-4 w-4" />
              Create Group
            </Button>
          }
        />
        <AddGroupModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSubmit={handleCreate}
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Groups"
        description="Manage your expense sharing groups."
        actions={
          <Button onClick={() => setModalOpen(true)}>
            <HiOutlinePlus className="h-4 w-4" />
            New Group
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {groups.map((group) => (
          <GroupCard
            key={group.id}
            group={group}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      <AddGroupModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
