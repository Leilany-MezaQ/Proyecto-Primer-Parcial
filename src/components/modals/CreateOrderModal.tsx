import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import OrderForm from './OrderForm'
import type { OrderFormValues } from './OrderForm'
import { useAuth } from '../../auth/AuthContext'
import type { Product } from '@/components/types'

interface CreateOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (payload: {
    userId: string
    status: string
    products: { productId: string; quantity: number }[]
  }) => Promise<void>
  availableProducts: Product[]
}

export default function CreateOrderModal({
  isOpen, onClose, onSave, availableProducts,
}: CreateOrderModalProps) {
  const { user } = useAuth()

  const defaultValues: OrderFormValues = {
    status: 'pending',
    products: [{ productId: '', quantity: 1 }],
  }

  const handleSubmit = async (values: OrderFormValues) => {
  if (!user) {
    console.error("No hay usuario autenticado");
    return;
  }

  const payload = {
    userId: user.id, // ✅ usa 'id' en lugar de '_id'
    status: values.status,
    products: values.products,
  };

  console.log('🛠️ CreateOrder payload:', payload);
  await onSave(payload);
  onClose();
};


  if (!isOpen) return null
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Orden</DialogTitle>
          <DialogDescription>Llena los datos de la nueva orden.</DialogDescription>
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
