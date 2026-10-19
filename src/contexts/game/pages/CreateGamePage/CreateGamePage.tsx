import { CreateGameForm } from '@/contexts/game/components/CreateGameForm/CreateGameForm';
import { useCreateGameVm } from '@/contexts/game/hooks/useCreateGameVm';
import { PageHeader } from '@/components/organisms/PageHeader/PageHeader';
import { PageLayout } from '@/components/templates/PageLayout/PageLayout';

export function CreateGamePage() {
  const vm = useCreateGameVm();

  return (
    <PageLayout header={<PageHeader title="Crear partida" />}>
      <CreateGameForm
        name={vm.name}
        nameError={vm.nameError}
        submitError={vm.submitError}
        canSubmit={vm.canSubmit}
        onNameChange={vm.handleNameChange}
        onNameBlur={vm.handleNameBlur}
        onSubmit={vm.handleSubmit}
      />
    </PageLayout>
  );
}
