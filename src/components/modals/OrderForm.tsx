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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Opciones de estado
const statusOptions = [
  { value: 'pending',    label: 'Pendiente'  },
  { value: 'processing', label: 'Procesando' },
  { value: 'completed',  label: 'Completada' },
  { value: 'cancelled',  label: 'Cancelada'  },
] as const

// Esquema Zod
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

  const { fields, append, remove } = useFieldArray({ control, name: 'products' })
  const status = watch('status')

  return (
    <Card className="shadow-xl border border-gray-200 rounded-2xl p-6 bg-white">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-800">Formulario de Orden</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Estado */}
          <div>
            <Label htmlFor="status" className="text-gray-700 font-medium">Estado</Label>
            <Select
              value={status}
              onValueChange={val =>
                setValue('status', val as any, { shouldValidate: true })
              }
            >
              <SelectTrigger className="mt-2 w-full border border-gray-300 rounded-lg">
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
              <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>
            )}
          </div>

          {/* Productos */}
          <div>
            <Label className="text-gray-700 font-medium">Productos</Label>
            <div className="space-y-3 mt-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border">
                  <select
                    {...register(`products.${index}.productId` as const)}
                    className="border rounded-lg px-3 py-2 flex-1"
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
                    {...register(`products.${index}.quantity` as const, { valueAsNumber: true })}
                    className="w-24 text-center"
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
                className="w-full mt-2"
                onClick={() => append({ productId: '', quantity: 1 })}
              >
                + Agregar producto
              </Button>

              {errors.products && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.products.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" className="px-6 py-2 text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg">
              Guardar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
