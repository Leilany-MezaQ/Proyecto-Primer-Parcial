export const statusOptions = [
  { value: 'pending',    label: 'Pendiente'   },
  { value: 'processing', label: 'Procesando'  },
  { value: 'completed',  label: 'Completada'  },
  { value: 'cancelled',  label: 'Cancelada'   },
] as const

// y un helper para invertir si tu back te regresa español:
export const spanishToValue: Record<string, typeof statusOptions[number]['value']> = {
  Pendiente:  'pending',
  Procesando: 'processing',
  Completada: 'completed',
  Cancelada:  'cancelled',
}
