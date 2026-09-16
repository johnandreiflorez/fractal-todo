import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { useAuth } from '../../hooks/useAuth.js';
import { registrar } from '../../servicios/auth.service.js';
import styles from './FormularioAuth.module.css';

const esquema = z
  .object({
    nombre: z
      .string()
      .trim()
      .min(2, 'errores.nombre_min')
      .max(100, 'errores.nombre_max100'),
    email: z.email('errores.email_invalido').trim(),
    password: z
      .string()
      .min(8, 'errores.password_min')
      .max(200, 'errores.password_max200'),
    confirmacion: z.string(),
  })
  .refine((datos) => datos.password === datos.confirmacion, {
    path: ['confirmacion'],
    message: 'errores.password_no_coinciden',
  });

type Campos = z.infer<typeof esquema>;

export function FormularioRegistro() {
  const { t } = useTranslation();
  const { iniciarSesion } = useAuth();
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
      const sesion = await registrar({
        nombre: valores.nombre,
        email: valores.email,
        password: valores.password,
      });
      iniciarSesion(sesion);
      navigate('/');
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
      <input
        className={styles.campo}
        placeholder={t('auth.nombre')}
        autoComplete="name"
        aria-label={t('auth.nombre')}
        {...register('nombre')}
      />
      {errors.nombre && <p className={styles.error}>{t(errors.nombre.message ?? '')}</p>}

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
        placeholder={t('auth.passwordLargo')}
        autoComplete="new-password"
        aria-label={t('auth.passwordLargo')}
        {...register('password')}
      />
      {errors.password && <p className={styles.error}>{t(errors.password.message ?? '')}</p>}

      <input
        className={styles.campo}
        type="password"
        placeholder={t('auth.passwordConfirmar')}
        autoComplete="new-password"
        aria-label={t('auth.passwordConfirmar')}
        {...register('confirmacion')}
      />
      {errors.confirmacion && <p className={styles.error}>{t(errors.confirmacion.message ?? '')}</p>}

      {error && <p className={styles.error}>{error}</p>}

      <button className={styles.boton} type="submit" disabled={isSubmitting}>
        {isSubmitting ? t('auth.creandoCuenta') : t('auth.crearCuenta')}
      </button>

      <p className={styles.enlace}>
        {t('auth.conCuenta')} <Link to="/login">{t('auth.iniciaSesion')}</Link>
      </p>
    </form>
  );
}