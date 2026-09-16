import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useEtiquetas } from '../../hooks/useEtiquetas.js';
import styles from './SelectorEtiquetas.module.css';

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
    <div className={styles.contenedor}>
      <div className={styles.chips}>
        {valor.map((nombre) => (
          <span key={nombre} className={styles.chip}>
            {nombre}
            <button
              type="button"
              className={styles.quitar}
              onClick={() => quitar(nombre)}
              aria-label={t('tarea.etiquetaChipAria', { nombre })}
            >
              ×
            </button>
          </span>
        ))}
        {valor.length === 0 && (
          <span className={styles.placeholder}>{t('tarea.sinEtiquetas')}</span>
        )}
      </div>
      <input
        className={styles.campo}
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
        <div className={styles.sugerencias}>
          {disponibles.slice(0, 6).map((etiqueta) => (
            <button
              key={etiqueta.id}
              type="button"
              className={styles.sugerencia}
              onClick={() => agregar(etiqueta.nombre)}
            >
              + {etiqueta.nombre}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}