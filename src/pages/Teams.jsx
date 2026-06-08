import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaPen, FaPlus, FaXmark, FaUsers } from 'react-icons/fa6'
import { useWorkspaceData } from '../hooks/useWorkspaceData'
import { createTeam, updateTeam } from '../services/api'
import { getEntityId } from '../utils/entity'

const getInitials = (name) =>
  String(name || '?')
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const Teams = () => {
  const navigate = useNavigate()
  const { teams, isLoading, addTeam, updateTeamInStore } = useWorkspaceData()

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const isEditing = Boolean(selectedTeam)

  const resetForm = () => {
    setSelectedTeam(null)
    setName('')
    setDesc('')
    setFormError('')
  }

  const openCreateModal = () => {
    resetForm()
    setModalOpen(true)
  }

  const openEditModal = (team) => {
    setSelectedTeam(team)
    setName(team.name || team.title || '')
    setDesc(team.description || '')
    setFormError('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    resetForm()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const payload = {
      name: name.trim(),
      description: desc.trim(),
    }

    if (!payload.name) {
      setFormError('Team name is required')
      return
    }

    setSaving(true)
    setFormError('')

    try {
      if (isEditing) {
        const teamId = getEntityId(selectedTeam)

        if (!teamId) {
          setFormError('This team cannot be updated because it has no id.')
          return
        }

        const updated = await updateTeam(teamId, payload)
        updateTeamInStore(teamId, { ...selectedTeam, ...updated, ...payload })
      } else {
        const created = await createTeam(payload)
        addTeam({ ...payload, ...created })
      }

      closeModal()
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          `Failed to ${isEditing ? 'update' : 'create'} team`,
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="tm">
      <button type="button" className="tm__back" onClick={() => navigate('/dashboard')}>
        <FaArrowLeft />
        <span>Back to Dashboard</span>
      </button>

      <div className="tm__header">
        <div>
          <h1 className="tm__title">Teams</h1>
          <p className="tm__subtitle">
            {isLoading ? 'Loading teams...' : 'Create teams and keep their details up to date.'}
          </p>
        </div>

        <button type="button" className="tm__new-btn" onClick={openCreateModal}>
          <FaPlus />
          <span>New Team</span>
        </button>
      </div>

      <div className="tm__list">
        {isLoading ? (
          <div className="tm__empty">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="tm__empty">
            <FaUsers className="tm__empty-icon" />
            <p>No teams yet. Create your first team.</p>
          </div>
        ) : (
          teams.map((team) => {
            const teamId = getEntityId(team)
            const teamName = team.name || team.title || 'Untitled Team'

            return (
              <div key={teamId || teamName} className="tm__row">
                <div className="tm__row-avatar">{getInitials(teamName)}</div>

                <div className="tm__row-info">
                  <p className="tm__row-name">{teamName}</p>
                  <p className="tm__row-desc">
                    {team.description || 'No description added yet.'}
                  </p>
                </div>

                <button
                  type="button"
                  className="tm__icon-btn"
                  onClick={() => openEditModal(team)}
                  aria-label={`Edit ${teamName}`}
                  title="Edit team"
                >
                  <FaPen />
                </button>
              </div>
            )
          })
        )}

        <div className="tm__add-row">
          <button type="button" className="tm__add-inline-btn" onClick={openCreateModal}>
            <FaPlus />
            <span>Add Team</span>
          </button>
        </div>
      </div>

      {modalOpen && (
        <div className="tm__modal-backdrop" onClick={closeModal}>
          <div className="tm__modal" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
            <div className="tm__modal-header">
              <div>
                <h2 className="tm__modal-title">
                  {isEditing ? 'Update Team' : 'Create Team'}
                </h2>
                <p className="tm__modal-sub">
                  {isEditing ? 'Edit the team name and description.' : 'Add a team to your workspace.'}
                </p>
              </div>

              <button type="button" className="tm__modal-close" onClick={closeModal} aria-label="Close">
                <FaXmark />
              </button>
            </div>

            <form className="tm__form" onSubmit={handleSubmit}>
              <div className="tm__field">
                <label className="tm__label" htmlFor="team-name">Team Name</label>
                <input
                  id="team-name"
                  className="tm__input"
                  type="text"
                  placeholder="Development"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoFocus
                />
              </div>

              <div className="tm__field">
                <label className="tm__label" htmlFor="team-description">Description</label>
                <textarea
                  id="team-description"
                  className="tm__input tm__textarea"
                  placeholder="What this team owns"
                  value={desc}
                  onChange={(event) => setDesc(event.target.value)}
                  rows={3}
                />
              </div>

              {formError && <p className="tm__form-error">{formError}</p>}

              <div className="tm__form-actions">
                <button type="submit" className="tm__submit-btn" disabled={saving}>
                  {saving
                    ? isEditing ? 'Updating...' : 'Creating...'
                    : isEditing ? 'Update Team' : 'Create Team'}
                </button>
                <button type="button" className="tm__cancel-btn" onClick={closeModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Teams
