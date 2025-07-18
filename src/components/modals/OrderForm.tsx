import { useForm, useFieldArray } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// Mapa de estados (value en inglés, label en español)
const statusOptions = [
  { value: 'pending',    label: 'Pendiente'  },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed',  label: 'Completada' },
  { value: 'cancelled',  label: 'Cancelada'  },
] as const

// Esquema de validación
export const orderSchema = z.object({
  status: z.enum(['pending','processing','completed','cancelled']),
  products: z
    .array(
      z.object({
        productId: z.string().min(1, 'Selecciona un producto'),
        quantity:  z.number().min(1, 'Cantidad mínima es 1'),
      })
    )
    .min(1, 'Agrega al menos un producto'),
})

export type OrderFormValues = z.infer<typeof orderSchema>

interface OrderFormProps {
  defaultValues: Partial<OrderFormValues>
  onSubmit: (values: OrderFormValues) => void
  availableProducts: { _id: string; name: string }[]
}

export default function OrderForm({
  defaultValues,
  onSubmit,
  availableProducts,
}: OrderFormProps) {
  // Aseguramos que venga un array de products
  const initial: OrderFormValues = {
    status:   defaultValues.status ?? 'pending',
    products: defaultValues.products ?? [{ productId: '', quantity: 1 }],
  }

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: initial,
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'products',
  })

  const status = watch('status')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Estado */}
      <div>
        <Label htmlFor="status">Estado</Label>
        <Select
          value={status}
          onValueChange={val =>
            setValue('status', val as any, { shouldValidate: true })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccionar estado" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-red-500 mt-1">{errors.status.message}</p>
        )}
      </div>

      {/* Productos */}
      <div>
        <Label>Productos</Label>
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2">
              <select
                {...register(`products.${index}.productId` as const)}
                className="border rounded px-2 py-1"
              >
                <option value="">Selecciona producto</option>
                {availableProducts.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <Input
                type="number"
                {...register(`products.${index}.quantity` as const, {
                  valueAsNumber: true,
                })}
                className="w-20"
                min={1}
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => remove(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => append({ productId: '', quantity: 1 })}
          >
            + Agregar producto
          </Button>

          {errors.products && (
            <p className="text-red-500 mt-1">
              {errors.products.message as string}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  )
}
