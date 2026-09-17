import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { mensajeDeError } from '../../api/cliente.js';
import { Button, Campo, Entrada } from '../../design-system/index.js';
import { useActualizarCategoria, useCrearCategoria } from '../../hooks/useCategorias.js';
import type { Categoria } from '../../tipos/index.js';

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
  categoria?: Categoria | null;
  onGuardada: () => void;
  onCancelar: () => void;
}

export function FormularioCategoria({ categoria, onGuardada, onCancelar }: Props) {
  const { t } = useTranslation();
  const crear = useCrearCategoria();
  const actualizar = useActualizarCategoria();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Campos>({
    resolver: zodResolver(esquema),
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      color: categoria?.color ?? undefined,
    },
  });

  const enviar = async (valores: Campos) => {
    try {
      setError(null);
      const datos = { nombre: valores.nombre, color: valores.color || null };
      if (categoria) {
        await actualizar.mutateAsync({ id: categoria.id, datos });
      } else {
        await crear.mutateAsync(datos);
      }
      reset();
      onGuardada();
    } catch (e) {
      setError(mensajeDeError(e));
    }
  };

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(enviar)} noValidate>
      <Campo
        etiqueta={t('categoria.nombre')}
        para="campo-categoria-nombre"
        error={errors.nombre ? t(errors.nombre.message ?? '') : undefined}
      >
        <Entrada
          id="campo-categoria-nombre"
          placeholder={t('categoria.nombre')}
          aria-label={t('categoria.nombre')}
          {...register('nombre')}
        />
      </Campo>

      <Campo
        etiqueta={t('categoria.color')}
        para="color-categoria"
        error={errors.color ? t(errors.color.message ?? '') : undefined}
      >
        <Entrada
          id="color-categoria"
          type="color"
          className="h-9 w-16 cursor-pointer p-1"
          {...register('color')}
        />
      </Campo>

      {error && <p className="text-sm text-peligro-fuerte">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button
          variante="secundario"
          type="button"
          disabled={isSubmitting}
          onClick={onCancelar}
        >
          {t('categoria.cancelar')}
        </Button>
        <Button type="submit" cargando={isSubmitting}>
          {categoria ? t('categoria.actualizar') : t('categoria.guardar')}
        </Button>
      </div>
    </form>
  );
}