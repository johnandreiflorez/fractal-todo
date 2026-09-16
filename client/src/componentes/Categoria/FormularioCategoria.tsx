import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { useCrearCategoria } from '../../hooks/useCategorias.js';
import styles from './FormularioCategoria.module.css';

const esquema = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'errores.nombre_obligatorio')
    .max(100, 'errores.nombre_max100'),
  color: z.string().trim().max(20, 'errores.color_max20').optional(),
});

type Campos = z.infer<typeof esquema>;

interface Props {
  onCreada: () => void;
  onCancelar: () => void;
}

export function FormularioCategoria({ onCreada, onCancelar }: Props) {
  const { t } = useTranslation();
  const crear = useCrearCategoria();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Campos>({ resolver: zodResolver(esquema) });

  const enviar = async (valores: Campos) => {
    try {
      setError(null);
      await crear.mutateAsync({ nombre: valores.nombre, color: valores.color || null });
      reset();
      onCreada();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <form className={styles.formulario} onSubmit={handleSubmit(enviar)}>
      <input
        className={styles.campo}
        placeholder={t('categoria.nombre')}
        aria-label={t('categoria.nombre')}
        {...register('nombre')}
      />
      {errors.nombre && <p className={styles.error}>{t(errors.nombre.message ?? '')}</p>}
      <div className={styles.filaColor}>
        <label className={styles.etiquetaColor} htmlFor="color-categoria">
          {t('categoria.color')}
        </label>
        <input
          className={styles.color}
          id="color-categoria"
          type="color"
          {...register('color')}
        />
      </div>
      {error && <p className={styles.error}>{error}</p>}
      <div className={styles.acciones}>
        <button className={styles.botonGuardar} type="submit">
          {t('categoria.guardar')}
        </button>
        <button className={styles.botonCancelar} type="button" onClick={onCancelar}>
          {t('categoria.cancelar')}
        </button>
      </div>
    </form>
  );
}