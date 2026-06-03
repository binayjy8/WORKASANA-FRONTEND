const getInitials = (name) => {
  return String(name || 'User')
    .split(' ')
    .map((item) => item[0])
    .join('')
    .toUpperCase()
}

const TeamCard = ({ member }) => {
  return (
    <article className="team-card">
      <div className="team-card__avatar">
        {getInitials(member.name)}
      </div>

      <div className="team-card__content">
        <h3>{member.name}</h3>
        <p>{member.role}</p>
        <span>{member.email}</span>
      </div>

      <div className="team-card__meta">
        <strong>{member.projects ?? 0}</strong>
        <span>Projects</span>
      </div>
    </article>
  )
}

export default TeamCard
