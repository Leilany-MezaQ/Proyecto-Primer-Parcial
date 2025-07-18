// File: src/components/modals/ProductForm.tsx
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const productSchema = z.object({
  name: z.string().min(3, 'Debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Precio inválido'),
  stock: z.number().int().min(0, 'Stock inválido'),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  defaultValues: ProductFormValues
  onSubmit: (values: ProductFormValues) => void
}

export default function ProductForm({ defaultValues, onSubmit }: ProductFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre del producto</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" {...register('description')} rows={3} />
        {errors.description && <p className="text-red-500 mt-1">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input id="price" type="number" step="0.01" {...register('price', { valueAsNumber: true })} />
          {errors.price && <p className="text-red-500 mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <Label htmlFor="stock">Stock</Label>
          <Input id="stock" type="number" {...register('stock', { valueAsNumber: true })} />
          {errors.stock && <p className="text-red-500 mt-1">{errors.stock.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}