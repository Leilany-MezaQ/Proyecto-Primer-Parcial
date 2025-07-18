import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'

const userSchema = z.object({
    name: z.string().min(3, 'Debe tener al menos 3 caracteres'),
    email: z.email({ message: 'Correo electrónico inválido' }),
    phone: z.string().min(7, 'Teléfono inválido'),
    password: z.string().optional(),
    roles: z.array(z.string()).min(1, 'Selecciona al menos un rol'),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormProps {
    defaultValues: UserFormValues
    onSubmit: (values: UserFormValues) => void
    availableRoles: { _id: string; type: string }[]
}

export default function UserForm({ defaultValues, onSubmit, availableRoles }: UserFormProps) {
    const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues,
    })

    const selectedRoles = watch('roles') || []

    const toggleRole = (roleId: string, checked: boolean) => {
        const newRoles = checked
            ? [...selectedRoles, roleId]
            : selectedRoles.filter(r => r !== roleId)
        setValue('roles', newRoles, { shouldValidate: true })
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Label htmlFor="name">Nombre completo</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-red-500 mt-1">{errors.phone.message}</p>}
            </div>

            <div>
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 mt-1">{errors.email.message}</p>}
            </div>

            <div>
                <Label htmlFor="password">Contraseña (opcional)</Label>
                <Input id="password" type="password" {...register('password')} />
            </div>

            <div>
                <Label>Roles</Label>
                <div className="space-y-2">
                    {availableRoles.map((role) => (
                        <div key={role._id} className="flex items-center space-x-2">
                            <Checkbox
                                id={role._id}
                                checked={selectedRoles.includes(role._id)}
                                onCheckedChange={(checked) => toggleRole(role._id, checked as boolean)}
                            />
                            <Label htmlFor={role._id}>{role.type}</Label>
                        </div>
                    ))}
                </div>
                {errors.roles && <p className="text-red-500 mt-1">{errors.roles.message}</p>}
            </div>

            <div className="flex justify-end">
                <Button type="submit">Guardar</Button>
            </div>
        </form>
    )
}