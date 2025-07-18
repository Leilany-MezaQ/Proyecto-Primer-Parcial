import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ProductForm from './ProductForm'
import type { Product } from '../types'

interface EditProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, data: any) => Promise<void>
  data: Product
}

export default function EditProductModal({ isOpen, onClose, onSave, data }: EditProductModalProps) {
  const handleSubmit = async (values: any) => {
    await onSave(data._id, values)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Producto</DialogTitle>
          <DialogDescription>Modifica los detalles del producto.</DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={{
            name: data.name,
            description: data.description,
            price: data.price,
            stock: data.stock,
          }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}