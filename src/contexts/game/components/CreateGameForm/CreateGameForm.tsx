import { memo, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { TextField } from '@/components/molecules/TextField/TextField';

interface CreateGameFormProps {
  name: string;
  nameError: string | null;
  submitError: string | null;
  canSubmit: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onSubmit: () => void;
}

// Organismo del contexto game. Figma desktop: ancho 292px y botón centrado con ancho automático.
// Inferencia mobile: el formulario ocupa todo el ancho disponible y el botón también.
export const CreateGameForm = memo(function CreateGameForm({
  name,
  nameError,
  submitError,
  canSubmit,
  onNameChange,
  onNameBlur,
  onSubmit,
}: CreateGameFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="flex w-full max-w-73 min-w-0 flex-col items-center gap-4"
    >
      <TextField
        label="Nombra la partida"
        name="gameName"
        autoComplete="off"
        value={name}
        error={nameError}
        onChange={(event) => onNameChange(event.target.value)}
        onBlur={onNameBlur}
      />
      <Button type="submit" disabled={!canSubmit} className="w-full md:w-auto">
        Crear partida
      </Button>
      {submitError && (
        <p role="alert" className="text-center text-p3 text-secondary-purple-300">
          {submitError}
        </p>
      )}
    </form>
  );
});
