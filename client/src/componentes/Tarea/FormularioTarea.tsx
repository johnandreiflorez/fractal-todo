import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { AreaTexto, Button, Campo, Entrada, Selector } from '../../design-system/index.js';
import { useCategorias } from '../../hooks/useCategorias.js';
import { useActualizarTarea, useCrearTarea } from '../../hooks/useTareas.js';
import type { Tarea } from '../../tipos/index.js';
import { SelectorEtiquetas } from '../Etiqueta/SelectorEtiquetas.js';

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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
      onClick={(evento) => {
        if (evento.target === evento.currentTarget) onCerrar();
      }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" aria-hidden="true" />
      <form
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col gap-4 overflow-y-auto rounded-xl border border-borde-fuerte bg-superficie p-6 shadow-modal animate-modal-in"
        onSubmit={handleSubmit(enviar)}
        noValidate
      >
        <h2 className="font-display text-lg font-semibold text-texto">
          {tarea ? t('tarea.tituloEditar') : t('tarea.tituloNueva')}
        </h2>

        <Campo
          etiqueta={t('tarea.titulo')}
          para="campo-titulo"
          requerido
          error={errors.titulo ? t(errors.titulo.message ?? '') : undefined}
        >
          <Entrada
            id="campo-titulo"
            placeholder={t('tarea.titulo')}
            autoFocus
            {...register('titulo')}
          />
        </Campo>

        <Campo
          etiqueta={t('tarea.descripcion')}
          para="campo-descripcion"
          error={errors.descripcion ? t(errors.descripcion.message ?? '') : undefined}
        >
          <AreaTexto
            id="campo-descripcion"
            rows={3}
            placeholder={t('tarea.descripcion')}
            {...register('descripcion')}
          />
        </Campo>

        <div className="grid gap-4 sm:grid-cols-3">
          <Campo etiqueta={t('tarea.prioridad')} para="campo-prioridad">
            <Selector id="campo-prioridad" {...register('prioridad')}>
              {PRIORIDADES.map((prioridad) => (
                <option key={prioridad} value={prioridad}>
                  {t(`prioridades.${prioridad}`)}
                </option>
              ))}
            </Selector>
          </Campo>

          <Campo etiqueta={t('tarea.categoria')} para="campo-categoria">
            <Selector id="campo-categoria" {...register('categoria_id')}>
              <option value="">{t('tarea.sinCategoria')}</option>
              {categorias?.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nombre}
                </option>
              ))}
            </Selector>
          </Campo>

          <Campo etiqueta={t('tarea.vence')} para="campo-fecha">
            <Entrada id="campo-fecha" type="date" {...register('fecha_vencimiento')} />
          </Campo>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-texto">{t('tarea.etiquetas')}</label>
          <SelectorEtiquetas valor={etiquetas} onChange={setEtiquetas} />
        </div>

        {error && <p className="text-sm text-peligro-fuerte">{error}</p>}

        <div className="flex justify-end gap-2">
          <Button
            variante="secundario"
            onClick={() => {
              reset();
              onCerrar();
            }}
          >
            {t('tarea.cancelar')}
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? t('tarea.guardando')
              : tarea
                ? t('tarea.guardarCambios')
                : t('tarea.crear')}
          </Button>
        </div>
      </form>
    </div>
  );
}