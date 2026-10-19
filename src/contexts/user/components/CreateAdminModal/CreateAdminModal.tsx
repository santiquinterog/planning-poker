import { Modal } from '@/components/molecules/Modal/Modal';
import { FormCard } from '@/components/molecules/FormCard/FormCard';
import { AdminForm } from '@/contexts/user/components/AdminForm/AdminForm';
import { useCreateAdminVm } from '@/contexts/user/hooks/useCreateAdminVm';

interface CreateAdminModalProps {
  gameSlug: string;
  onCreated: () => void;
}

// Modal obligatoria: se muestra sobre la mesa hasta que el usuario completa el formulario.
export function CreateAdminModal({ gameSlug, onCreated }: CreateAdminModalProps) {
  const vm = useCreateAdminVm(gameSlug, onCreated);

  return (
    <Modal title="Crear usuario" isOpen>
      <FormCard>
        <AdminForm
          name={vm.name}
          nameError={vm.nameError}
          role={vm.role}
          submitError={vm.submitError}
          canSubmit={vm.canSubmit}
          onNameChange={vm.handleNameChange}
          onNameBlur={vm.handleNameBlur}
          onRoleChange={vm.handleRoleChange}
          onSubmit={vm.handleSubmit}
        />
      </FormCard>
    </Modal>
  );
}
