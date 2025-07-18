import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import ProductForm from './ProductForm'

interface CreateProductModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
}

export default function CreateProductModal({ isOpen, onClose, onSave }: CreateProductModalProps) {
  const handleSubmit = async (values: any) => {
    await onSave(values)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Producto</DialogTitle>
          <DialogDescription>Llena los datos del nuevo producto.</DialogDescription>
        </DialogHeader>
        <ProductForm
          defaultValues={{ name: '', description: '', price: 0, stock: 0 }}
          onSubmit={handleSubmit}
        />
      </DialogContent>
    </Dialog>
  )
}