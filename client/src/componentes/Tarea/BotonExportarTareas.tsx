import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { FileJson, FileSpreadsheet } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import { Button } from '../../design-system/index.js';
import { listarTareas } from '../../servicios/tareas.service.js';
import {
  descargarTexto,
  nombreExportacion,
  tareasACSV,
  tareasAJSON,
} from '../../utils/exportar.js';

type FormatoExportacion = 'csv' | 'json';

export function BotonExportarTareas() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [exportando, setExportando] = useState<FormatoExportacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const exportar = async (formato: FormatoExportacion) => {
    if (exportando !== null) return;
    try {
      setError(null);
      setExportando(formato);
      const tareas = await queryClient.fetchQuery({
        queryKey: ['tareas', 'exportacion'],
        queryFn: () => listarTareas(),
      });
      if (formato === 'csv') {
        descargarTexto(
          nombreExportacion('csv'),
          `\uFEFF${tareasACSV(tareas)}`,
          'text/csv;charset=utf-8',
        );
      } else {
        descargarTexto(
          nombreExportacion('json'),
          tareasAJSON(tareas),
          'application/json;charset=utf-8',
        );
      }
    } catch (e) {
      setError(mensajeDeError(e));
    } finally {
      setExportando(null);
    }
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variante="secundario"
          tamano="sm"
          disabled={exportando !== null}
          cargando={exportando === 'csv'}
          icono={<FileSpreadsheet className="h-4 w-4" aria-hidden="true" />}
          onClick={() => void exportar('csv')}
        >
          {t('tarea.exportarCsv')}
        </Button>
        <Button
          variante="secundario"
          tamano="sm"
          disabled={exportando !== null}
          cargando={exportando === 'json'}
          icono={<FileJson className="h-4 w-4" aria-hidden="true" />}
          onClick={() => void exportar('json')}
        >
          {t('tarea.exportarJson')}
        </Button>
      </div>
      {error && <p className="text-sm text-peligro-fuerte">{error}</p>}
    </div>
  );
}
