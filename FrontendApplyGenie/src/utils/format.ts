export const formatDate = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatTime = (date: string | Date): string => {
  const d = new Date(date)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    applied: 'bg-blue-500/10 text-blue-400',
    rejected: 'bg-red-500/10 text-red-400',
    interview: 'bg-purple-500/10 text-purple-400',
    offer: 'bg-green-500/10 text-green-400',
  }
  return colors[status] || 'bg-gray-500/10 text-gray-400'
}

export const getStatusBorder = (status: string): string => {
  const borders: Record<string, string> = {
    pending: 'border-yellow-500/20',
    applied: 'border-blue-500/20',
    rejected: 'border-red-500/20',
    interview: 'border-purple-500/20',
    offer: 'border-green-500/20',
  }
  return borders[status] || 'border-gray-500/20'
}

export const getLevelColor = (level: string): string => {
  const colors: Record<string, string> = {
    INFO: 'text-blue-400',
    SUCCESS: 'text-green-400',
    WARNING: 'text-yellow-400',
    ERROR: 'text-red-400',
    DEBUG: 'text-gray-400',
  }
  return colors[level] || 'text-gray-400'
}
