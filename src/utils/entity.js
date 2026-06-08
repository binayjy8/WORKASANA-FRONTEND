export const getEntityId = (entity) => {
  if (typeof entity === 'string' || typeof entity === 'number') return entity
  return entity?._id || entity?.id
}

export const isSameEntityId = (left, right) => {
  if (left === null || left === undefined || right === null || right === undefined) {
    return false
  }

  return String(left) === String(right)
}
