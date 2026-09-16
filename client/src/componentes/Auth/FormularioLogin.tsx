import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { useAuth } from '../../hooks/useAuth.js';
import { iniciarSesion } from '../../servicios/auth.service.js';
import styles from './FormularioAuth.module.css';

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
    <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
      <input
        className={styles.campo}
        type="email"
        placeholder={t('auth.email')}
        autoComplete="email"
        aria-label={t('auth.email')}
        {...register('email')}
      />
      {errors.email && <p className={styles.error}>{t(errors.email.message ?? '')}</p>}

      <input
        className={styles.campo}
        type="password"
        placeholder={t('auth.password')}
        autoComplete="current-password"
        aria-label={t('auth.password')}
        {...register('password')}
      />
      {errors.password && <p className={styles.error}>{t(errors.password.message ?? '')}</p>}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.boton} type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('auth.iniciando') : t('auth.iniciar')}
      </button>

      <p className={styles.enlace}>
        {t('auth.sinCuenta')} <Link to="/registro">{t('auth.registrate')}</Link>
      </p>
    </form>
  );
}