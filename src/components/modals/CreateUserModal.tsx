import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import UserForm from './UserForm'
import type { Role } from '../types'

interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: any) => Promise<void>
  availableRoles: Role[]
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSave,
  availableRoles,
}: CreateUserModalProps) {
  const handleSubmit = async (values: any) => {
    // Depuración: ver exactamente qué vas a enviar
    console.log('🛠️ CreateUserModal payload:', values)

    try {
      await onSave(values)
      onClose()
    } catch (err) {
      console.error('Error al crear usuario:', err)
      // aquí podrías mostrar un toast o setear un error en estado si quieres
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Usuario</DialogTitle>
          <DialogDescription>Llena los datos del nuevo usuario.</DialogDescription>
        </DialogHeader>
        <UserForm
          defaultValues={{ name: '', email: '', phone: '', password: '', roles: [] }}
          onSubmit={handleSubmit}
          availableRoles={availableRoles}
        />
      </DialogContent>
    </Dialog>
  )
}
