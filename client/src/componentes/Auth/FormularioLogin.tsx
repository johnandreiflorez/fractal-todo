import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { Button, Entrada } from '../../design-system/index.js';
import { useAuth } from '../../hooks/useAuth.js';
import { iniciarSesion } from '../../servicios/auth.service.js';

const esquema = z.object({
  email: z.email('errores.email_invalido').trim(),
  password: z.string().min(1, 'errores.password_obligatoria'),
});

type Campos = z.infer<typeof esquema>;

export function FormularioLogin() {
  const { t } = useTranslation();
  const { iniciarSesion: guardarSesion } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({ resolver: zodResolver(esquema) });

  const enviar = async (valores: Campos) => {
    try {
      setError(null);
      const sesion = await iniciarSesion(valores);
      guardarSesion(sesion);
      navigate('/');
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(enviar)} noValidate>
      <Entrada
        type="email"
        placeholder={t('auth.email')}
        autoComplete="email"
        aria-label={t('auth.email')}
        {...register('email')}
      />
      {errors.email && (
        <p className="text-sm text-peligro-fuerte">{t(errors.email.message ?? '')}</p>
      )}

      <Entrada
        type="password"
        placeholder={t('auth.password')}
        autoComplete="current-password"
        aria-label={t('auth.password')}
        {...register('password')}
      />
      {errors.password && (
        <p className="text-sm text-peligro-fuerte">{t(errors.password.message ?? '')}</p>
      )}

      {error && <p className="text-sm text-peligro-fuerte">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? t('auth.iniciando') : t('auth.iniciar')}
      </Button>

      <p className="text-center text-sm text-texto-suave">
        {t('auth.sinCuenta')}{' '}
        <Link className="font-medium text-primario hover:underline" to="/registro">
          {t('auth.registrate')}
        </Link>
      </p>
    </form>
  );
}