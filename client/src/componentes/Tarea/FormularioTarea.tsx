import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { useCategorias } from '../../hooks/useCategorias.js';
import { useActualizarTarea, useCrearTarea } from '../../hooks/useTareas.js';
import { SelectorEtiquetas } from '../Etiqueta/SelectorEtiquetas.js';
import type { Tarea } from '../../tipos/index.js';
import styles from './FormularioTarea.module.css';

const esquema = z.object({
  titulo: z.string().trim().min(1, 'errores.titulo_obligatorio').max(255, 'errores.titulo_max255'),
  descripcion: z.string().trim().max(5000, 'errores.descripcion_max5000').optional(),
  prioridad: z.string().optional(),
  categoria_id: z.string().optional(),
  fecha_vencimiento: z.string().optional(),
});

type Campos = z.infer<typeof esquema>;

const PRIORIDADES = [1, 2, 3, 4, 5] as const;

interface Props {
  abierto: boolean;
  tarea?: Tarea | null;
  onCerrar: () => void;
}

export function FormularioTarea({ abierto, tarea, onCerrar }: Props) {
  const { t } = useTranslation();
  const { data: categorias } = useCategorias();
  const crear = useCrearTarea();
  const actualizar = useActualizarTarea();
  const [error, setError] = useState<string | null>(null);
  const [etiquetas, setEtiquetas] = useState<string[]>(tarea?.etiquetas ?? []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({
    resolver: zodResolver(esquema),
    values: {
      titulo: tarea?.titulo ?? '',
      descripcion: tarea?.descripcion ?? '',
      prioridad: String(tarea?.prioridad ?? 3),
      categoria_id: tarea?.categoria_id != null ? String(tarea.categoria_id) : '',
      fecha_vencimiento: tarea?.fecha_vencimiento ?? '',
    },
  });

  if (!abierto) return null;

  const enviar = async (valores: Campos) => {
    try {
      setError(null);
      const datos = {
        titulo: valores.titulo,
        descripcion: valores.descripcion?.trim() || null,
        prioridad: Number(valores.prioridad ?? 3),
        categoria_id: valores.categoria_id ? Number(valores.categoria_id) : null,
        fecha_vencimiento: valores.fecha_vencimiento || null,
        etiquetas,
      };
      if (tarea) {
        await actualizar.mutateAsync({ id: tarea.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }
      reset();
      onCerrar();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <div
      className={styles.trasfondo}
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
      role="presentation"
    >
      <form className={styles.formulario} onSubmit={handleSubmit(enviar)} noValidate>
        <h2 className={styles.titulo}>
          {tarea ? t('tarea.tituloEditar') : t('tarea.tituloNueva')}
        </h2>

        <label className={styles.etiqueta} htmlFor="campo-titulo">
          {t('tarea.titulo')}
        </label>
        <input
          className={styles.campo}
          id="campo-titulo"
          placeholder={t('tarea.titulo')}
          autoFocus
          {...register('titulo')}
        />
        {errors.titulo && <p className={styles.error}>{t(errors.titulo.message ?? '')}</p>}

        <label className={styles.etiqueta} htmlFor="campo-descripcion">
          {t('tarea.descripcion')}
        </label>
        <textarea
          className={styles.campo}
          id="campo-descripcion"
          rows={3}
          placeholder={t('tarea.descripcion')}
          {...register('descripcion')}
        />
        {errors.descripcion && <p className={styles.error}>{t(errors.descripcion.message ?? '')}</p>}

        <div className={styles.fila}>
          <div className={styles.grupo}>
            <label className={styles.etiqueta} htmlFor="campo-prioridad">
              {t('tarea.prioridad')}
            </label>
            <select
              className={styles.campo}
              id="campo-prioridad"
              {...register('prioridad')}
            >
              {PRIORIDADES.map((prioridad) => (
                <option key={prioridad} value={prioridad}>
                  {t(`prioridades.${prioridad}`)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.grupo}>
            <label className={styles.etiqueta} htmlFor="campo-categoria">
              {t('tarea.categoria')}
            </label>
            <select
              className={styles.campo}
              id="campo-categoria"
              {...register('categoria_id')}
            >
              <option value="">{t('tarea.sinCategoria')}</option>
              {categorias?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.grupo}>
            <label className={styles.etiqueta} htmlFor="campo-fecha">
              {t('tarea.vence')}
            </label>
            <input
              className={styles.campo}
              id="campo-fecha"
              type="date"
              {...register('fecha_vencimiento')}
            />
          </div>
        </div>

        <label className={styles.etiqueta}>{t('tarea.etiquetas')}</label>
        <SelectorEtiquetas valor={etiquetas} onChange={setEtiquetas} />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.acciones}>
          <button className={styles.botonGuardar} type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('tarea.guardando')
              : tarea
                ? t('tarea.guardarCambios')
                : t('tarea.crear')}
          </button>
          <button
            className={styles.botonCancelar}
            type="button"
            onClick={() => {
              reset();
              onCerrar();
            }}
          >
            {t('tarea.cancelar')}
          </button>
        </div>
      </form>
    </div>
  );
}