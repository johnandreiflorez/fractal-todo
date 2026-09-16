import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plus, X } from 'lucide-react';
import { Entrada } from '../../design-system/index.js';
import { useEtiquetas } from '../../hooks/useEtiquetas.js';

interface Props {
  valor: string[];
  onChange: (etiquetas: string[]) => void;
}

export function SelectorEtiquetas({ valor, onChange }: Props) {
  const { t } = useTranslation();
  const { data: etiquetas } = useEtiquetas();
  const [texto, setTexto] = useState('');

  const agregar = (nombre: string) => {
    const limpia = nombre.trim();
    if (!limpia) return;
    if (valor.some((existente) => existente.toLowerCase() === limpia.toLowerCase())) return;
    onChange([...valor, limpia]);
    setTexto('');
  };

  const quitar = (nombre: string) => onChange(valor.filter((e) => e !== nombre));

  const disponibles =
    etiquetas?.filter(
      (etiqueta) =>
        !valor.some((v) => v.toLowerCase() === etiqueta.nombre.toLowerCase()),
    ) ?? [];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {valor.map((nombre) => (
          <span
            key={nombre}
            className="inline-flex items-center gap-1 rounded-full bg-primario-suave px-2.5 py-0.5 text-xs font-semibold text-primario-oscuro"
          >
            {nombre}
            <button
              type="button"
              className="cursor-pointer text-primario-oscuro hover:text-primario"
              onClick={() => quitar(nombre)}
              aria-label={t('tarea.etiquetaChipAria', { nombre })}
            >
              <X className="h-3 w-3" aria-hidden="true" />
            </button>
          </span>
        ))}
        {valor.length === 0 && (
          <span className="text-sm text-texto-atenuado">{t('tarea.sinEtiquetas')}</span>
        )}
      </div>

      <Entrada
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={(evento) => {
          if (evento.key === 'Enter') {
            evento.preventDefault();
            agregar(texto);
          }
        }}
        placeholder={t('tarea.escribirEtiqueta')}
        aria-label={t('tarea.anadirEtiquetaAria')}
      />

      {disponibles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {disponibles.slice(0, 6).map((etiqueta) => (
            <button
              key={etiqueta.id}
              type="button"
              className="inline-flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 text-sm text-primario transition-colors hover:bg-primario-suave"
              onClick={() => agregar(etiqueta.nombre)}
            >
              <Plus className="h-3 w-3" aria-hidden="true" />
              {etiqueta.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}