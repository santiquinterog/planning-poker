import { memo, type FormEvent } from 'react';
import { Button } from '@/components/atoms/Button/Button';
import { RadioOption } from '@/components/molecules/RadioOption/RadioOption';
import { TextField } from '@/components/molecules/TextField/TextField';
import { USER_ROLES, type UserRole } from '@/contexts/user/domain/user';

const ROLE_LABELS: Record<UserRole, string> = {
  player: 'Jugador',
  spectator: 'Espectador',
};

interface AdminFormProps {
  name: string;
  nameError: string | null;
  role: UserRole | null;
  submitError: string | null;
  canSubmit: boolean;
  onNameChange: (value: string) => void;
  onNameBlur: () => void;
  onRoleChange: (role: UserRole) => void;
  onSubmit: () => void;
}

// Formulario para elegir nombre y rol (Jugador / Espectador) al entrar a la partida.
export const AdminForm = memo(function AdminForm({
  name,
  nameError,
  role,
  submitError,
  canSubmit,
  onNameChange,
  onNameBlur,
  onRoleChange,
  onSubmit,
}: AdminFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit();
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
      <TextField
        label="Tu nombre"
        name="userName"
        autoComplete="off"
        value={name}
        error={nameError}
        onChange={(event) => onNameChange(event.target.value)}
        onBlur={onNameBlur}
      />
      <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <legend className="sr-only">Rol en la partida</legend>
        {USER_ROLES.map((option) => (
          <RadioOption
            key={option}
            name="role"
            value={option}
            label={ROLE_LABELS[option]}
            checked={role === option}
            onChange={() => onRoleChange(option)}
          />
        ))}
      </fieldset>
      <Button type="submit" disabled={!canSubmit} className="mt-2 w-full md:w-auto md:self-center">
        Continuar
      </Button>
      {submitError && (
        <p role="alert" className="text-center text-p3 text-secondary-purple-300">
          {submitError}
        </p>
      )}
    </form>
  );
});
