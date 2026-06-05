const getInitials = (name) => {
  return String(name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const AVATAR_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899',
  '#f59e0b', '#10b981', '#3b82f6',
]

const getAvatarColor = (name) => {
  const index = String(name || '').charCodeAt(0) % AVATAR_COLORS.length
  return AVATAR_COLORS[index]
}

const TeamCard = ({ member }) => {
  return (
    <article className="team-card">

      {/* AVATAR */}
      <div
        className="team-card__avatar"
        style={{ background: getAvatarColor(member.name) }}
      >
        {getInitials(member.name)}
      </div>

      {/* INFO */}
      <div className="team-card__content">
        <h3 className="team-card__name">{member.name}</h3>
        <p className="team-card__role">{member.role || 'Team Member'}</p>
        <span className="team-card__email">{member.email}</span>
      </div>

      {/* PROJECTS COUNT */}
      <div className="team-card__meta">
        <strong>{member.projects ?? 0}</strong>
        <span>Projects</span>
      </div>

    </article>
  )
}

export default TeamCard
