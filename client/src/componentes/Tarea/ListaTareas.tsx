import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus } from 'lucide-react';
import { mensajeDeError } from '../../api/cliente.js';
import {
  Button,
  EstadoVacio,
  IndicadorCarga,
  MensajeError,
  Tecla,
} from '../../design-system/index.js';
import { useAtajosTeclado } from '../../hooks/useAtajosTeclado.js';
import {
  useActualizarTareasEnLote,
  useCompletarTarea,
  useEliminarTarea,
  useEliminarTareasEnLote,
  useTareas,
} from '../../hooks/useTareas.js';
import type { CambiosLote, Tarea } from '../../tipos/index.js';
import { aFiltrosTareas } from '../../utils/helpers.js';
import type { OpcionesFiltrosTareas } from '../../utils/helpers.js';
import { zonaEnPunto } from '../../utils/arrastre.js';
import type { ZonaArrastre } from '../../utils/arrastre.js';
import { BarraAccionesLote } from './BarraAccionesLote.js';
import { BotonExportarTareas } from './BotonExportarTareas.js';
import { FiltroTareas } from './FiltroTareas.js';
import { FormularioTarea } from './FormularioTarea.js';
import { ItemTarea } from './ItemTarea.js';
import { TarjetaArrastrada } from './TarjetaArrastrada.js';
import { ZonasArrastre } from './ZonasArrastre.js';

export function ListaTareas() {
  const { t } = useTranslation();
  const [filtros, setFiltros] = useState<OpcionesFiltrosTareas>({});
  const {
    data: tareas,
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useTareas(aFiltrosTareas(filtros));

  const refrescando = isFetching && !isPending;

  const [seleccion, setSeleccion] = useState<ReadonlySet<number>>(new Set());
  const [creando, setCreando] = useState(false);
  const [editando, setEditando] = useState<Tarea | null>(null);
  const [tareaArrastrada, setTareaArrastrada] = useState<Tarea | null>(null);
  const [zonaActiva, setZonaActiva] = useState<ZonaArrastre | null>(null);
  const [puntoArrastre, setPuntoArrastre] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [errorAccion, setErrorAccion] = useState<string | null>(null);
  const cuadroArrastre = useRef<number | null>(null);
  const puntoPendiente = useRef<{ x: number; y: number } | null>(null);

  const actualizarEnLote = useActualizarTareasEnLote();
  const eliminarEnLote = useEliminarTareasEnLote();
  const completarTarea = useCompletarTarea();
  const eliminarTarea = useEliminarTarea();

  const idsVisibles = useMemo(() => tareas?.map((tarea) => tarea.id) ?? [], [tareas]);
  const idsSeleccionados = useMemo(() => [...seleccion], [seleccion]);
  const todasSeleccionadas =
    idsVisibles.length > 0 && idsVisibles.every((id) => seleccion.has(id));

  const ocupadoLote = actualizarEnLote.isPending || eliminarEnLote.isPending;

  const alternarSeleccion = useCallback((id: number, marcada: boolean) => {
    setSeleccion((previas) => {
      const siguientes = new Set(previas);
      if (marcada) siguientes.add(id);
      else siguientes.delete(id);
      return siguientes;
    });
  }, []);

  const alternarSeleccionTodas = () => {
    setSeleccion(todasSeleccionadas ? new Set() : new Set(idsVisibles));
  };

  const ejecutar = async (
    accion: () => Promise<unknown>,
    limpiarSeleccion = false,
  ) => {
    try {
      setErrorAccion(null);
      await accion();
      if (limpiarSeleccion) setSeleccion(new Set());
    } catch (e) {
      setErrorAccion(mensajeDeError(e));
    }
  };

  const aplicarEnLote = (cambios: CambiosLote) => {
    if (idsSeleccionados.length === 0) return;
    void ejecutar(
      () => actualizarEnLote.mutateAsync({ ids: idsSeleccionados, cambios }),
      true,
    );
  };

  const eliminarSeleccionadas = () => {
    if (idsSeleccionados.length === 0) return;
    if (!window.confirm(t('tarea.eliminarConfirmLote', { count: idsSeleccionados.length }))) {
      return;
    }
    void ejecutar(() => eliminarEnLote.mutateAsync(idsSeleccionados), true);
  };

  const soltarParaEliminar = (tarea: Tarea) => {
    if (!window.confirm(t('tarea.eliminarConfirmUno', { titulo: tarea.titulo }))) return;
    void ejecutar(() => eliminarTarea.mutateAsync(tarea.id));
  };

  const soltarParaCambiarEstado = (tarea: Tarea) => {
    void ejecutar(() =>
      completarTarea.mutateAsync({ id: tarea.id, completada: !tarea.completada }),
    );
  };

  const accionesSoltar = useRef({ soltarParaEliminar, soltarParaCambiarEstado });
  useEffect(() => {
    accionesSoltar.current = { soltarParaEliminar, soltarParaCambiarEstado };
  });

  useEffect(
    () => () => {
      if (cuadroArrastre.current !== null) {
        window.cancelAnimationFrame(cuadroArrastre.current);
      }
    },
    [],
  );

  const actualizarPunto = useCallback((x: number, y: number) => {
    puntoPendiente.current = { x, y };
    if (cuadroArrastre.current !== null) return;
    cuadroArrastre.current = window.requestAnimationFrame(() => {
      cuadroArrastre.current = null;
      setPuntoArrastre(puntoPendiente.current);
    });
  }, []);

  const manejarArrastrar = useCallback(
    (tarea: Tarea, x: number, y: number) => {
      setTareaArrastrada((actual) => (actual?.id === tarea.id ? actual : tarea));
      setZonaActiva((actual) => {
        const zona = zonaEnPunto(x, y);
        return actual === zona ? actual : zona;
      });
      actualizarPunto(x, y);
    },
    [actualizarPunto],
  );

  const manejarSoltar = useCallback((tarea: Tarea, x: number, y: number) => {
    const zona = zonaEnPunto(x, y);
    setTareaArrastrada(null);
    setZonaActiva(null);
    setPuntoArrastre(null);
    puntoPendiente.current = null;
    if (zona === 'izquierda') accionesSoltar.current.soltarParaEliminar(tarea);
    else if (zona === 'derecha') accionesSoltar.current.soltarParaCambiarEstado(tarea);
  }, []);

  const cancelarArrastre = useCallback(() => {
    setTareaArrastrada(null);
    setZonaActiva(null);
    setPuntoArrastre(null);
    puntoPendiente.current = null;
  }, []);

  useAtajosTeclado(
    [
      { teclas: 'n', accion: () => setCreando(true) },
      { teclas: 'mod+a', accion: () => setSeleccion(new Set(idsVisibles)) },
      { teclas: 'x', accion: () => aplicarEnLote({ completada: true }) },
      { teclas: 'shift+x', accion: () => aplicarEnLote({ completada: false }) },
      { teclas: 'delete', accion: eliminarSeleccionadas },
    ],
    !creando && !editando,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-texto">
            {t('tarea.misTareas')}
          </h1>
          {refrescando && (
            <span
              role="status"
              className="inline-flex items-center gap-1.5 text-sm text-texto-atenuado"
            >
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {t('comunes.actualizando')}
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BotonExportarTareas />
          <Button
            variante="primario"
            icono={<Plus className="h-4 w-4" aria-hidden="true" />}
            aria-keyshortcuts="N"
            onClick={() => setCreando(true)}
          >
            {t('tarea.nuevaTarea')} <Tecla>N</Tecla>
          </Button>
        </div>
      </div>

      <FiltroTareas valor={filtros} onChange={setFiltros} />

      {seleccion.size > 0 && (
        <BarraAccionesLote
          ids={idsSeleccionados}
          ocupado={ocupadoLote}
          cargandoCompletar={
            actualizarEnLote.isPending &&
            actualizarEnLote.variables?.cambios.completada === true
          }
          cargandoReabrir={
            actualizarEnLote.isPending &&
            actualizarEnLote.variables?.cambios.completada === false
          }
          cargandoEliminar={eliminarEnLote.isPending}
          error={errorAccion}
          onCompletar={() => aplicarEnLote({ completada: true })}
          onReabrir={() => aplicarEnLote({ completada: false })}
          onAsignarPrioridad={(prioridad) => aplicarEnLote({ prioridad })}
          onMoverCategoria={(categoriaId) => aplicarEnLote({ categoria_id: categoriaId })}
          onEliminar={eliminarSeleccionadas}
        />
      )}

      {idsVisibles.length > 0 && (
        <label className="inline-flex w-fit cursor-pointer items-center gap-2 text-sm text-texto-suave">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primario"
            checked={todasSeleccionadas}
            onChange={alternarSeleccionTodas}
            aria-keyshortcuts="Control+A Meta+A"
          />
          {t('tarea.seleccionarVisibles')}
        </label>
      )}

      {errorAccion && seleccion.size === 0 && (
        <p role="alert" className="text-sm text-peligro-fuerte">
          {errorAccion}
        </p>
      )}

      {isPending && <IndicadorCarga texto={t('comunes.cargandoTareas')} />}

      {isError && (
        <MensajeError
          mensaje={mensajeDeError(error)}
          textoReintentar={t('comunes.reintentar')}
          onReintentar={() => void refetch()}
        />
      )}

      {!isPending && !isError && (tareas?.length ?? 0) === 0 && (
        <EstadoVacio mensaje={t('tarea.vacio')} />
      )}

      {!isPending && !isError && (tareas?.length ?? 0) > 0 && (
        <ul className="flex flex-col gap-3">
          {tareas?.map((tarea) => (
            <ItemTarea
              key={tarea.id}
              tarea={tarea}
              seleccionada={seleccion.has(tarea.id)}
              onCambiarSeleccion={alternarSeleccion}
              onEditar={setEditando}
              onArrastrar={manejarArrastrar}
              onSoltar={manejarSoltar}
              onCancelarArrastre={cancelarArrastre}
            />
          ))}
        </ul>
      )}

      <ZonasArrastre tarea={tareaArrastrada} zonaActiva={zonaActiva} />

      {tareaArrastrada && puntoArrastre && (
        <TarjetaArrastrada
          tarea={tareaArrastrada}
          x={puntoArrastre.x}
          y={puntoArrastre.y}
        />
      )}

      {creando && <FormularioTarea abierto onCerrar={() => setCreando(false)} />}

      {editando && (
        <FormularioTarea
          abierto
          tarea={editando}
          onCerrar={() => setEditando(null)}
        />
      )}
    </section>
  );
}
