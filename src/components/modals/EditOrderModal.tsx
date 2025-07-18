import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import OrderForm  from './OrderForm'
import type { OrderFormValues } from './OrderForm'
import type { Order, Product } from '@/components/types'

// Mapa de estados: value en inglés, label en español
const statusOptions = [
  { value: 'pending',    label: 'Pendiente'  },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed',  label: 'Completada' },
  { value: 'cancelled',  label: 'Cancelada'  },
] as const

// Permite convertir etiquetas españolas a valores
const spanishToValue: Record<string, typeof statusOptions[number]['value']> = {
  Pendiente:  'pending',
  Procesando: 'processing',
  Completada: 'completed',
  Cancelada:  'cancelled',
}

interface EditOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (
    id: string,
    payload: { status: string; products: { price: number; quantity: number }[] }
  ) => Promise<void>
  data: Order | null
  availableProducts: Product[]
}

export default function EditOrderModal({
  isOpen,
  onClose,
  onSave,
  data,
  availableProducts,
}: EditOrderModalProps) {
  if (!isOpen || !data) return null

  // Normaliza status entrante: si viene en inglés lo usamos,
  // si en español lo convertimos, si no, fallback "pending"
  const incoming = data.status
  const initialStatus = statusOptions.some(o => o.value === incoming)
    ? incoming
    : spanishToValue[incoming] ?? 'pending'

  // Construye los valores por defecto para el formulario
  const defaultValues: OrderFormValues = {
    status: initialStatus,
    products: (data.products || []).map(p => ({
      productId:
        typeof p.productId === 'string'
          ? p.productId
          : p.productId?._id ?? '',
      quantity: p.quantity,
    })),
  }

  const handleSubmit = async (values: OrderFormValues) => {
    // 1) Genera el payload EXACTO que el backend espera:
    const payload = {
      status: values.status,  // siempre en inglés
      products: values.products.map(item => {
        const prod = availableProducts.find(x => x._id === item.productId)
        return {
          price:    prod?.price ?? 0,
          quantity: item.quantity,
        }
      }),
    }

    try {
      await onSave(data._id, payload)
      onClose()
    } catch (err) {
      console.error('Error al guardar orden:', err)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Orden</DialogTitle>
          <DialogDescription>Modifica estado y productos.</DialogDescription>
        </DialogHeader>
        <OrderForm
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          availableProducts={availableProducts}
        />
      </DialogContent>
    </Dialog>
  )
}
