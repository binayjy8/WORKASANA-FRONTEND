const EmptyState = ({ title, description, icon }) => {
  return (
    <div className="empty-state">
      {icon && <div className="empty-state__icon">{icon}</div>}
      <strong className="empty-state__title">{title}</strong>
      {description && <p className="empty-state__description">{description}</p>}
    </div>
  )
}

export default EmptyState
