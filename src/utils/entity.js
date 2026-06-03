export const getEntityId = (entity) => entity?._id || entity?.id

export const isSameEntityId = (left, right) => {
  return String(left) === String(right)
}
