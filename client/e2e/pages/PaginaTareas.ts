import { expect, type Locator, type Page } from '@playwright/test';
import type { Traductor } from '../i18n/recursos.js';
import { Pagina } from './Pagina.js';

export type CampoOrden =
  | 'creado_en'
  | 'fecha_vencimiento'
  | 'prioridad'
  | 'titulo';

export class PaginaTareas extends Pagina {
  constructor(pagina: Page, t: Traductor) {
    super(pagina, t);
  }

  private main(): Locator {
    return this.pagina.getByRole('main');
  }

  private lista(): Locator {
    return this.main().getByRole('list');
  }

  async esperarCarga(): Promise<void> {
    await expect(this.titulo()).toBeVisible();
  }

  titulo(): Locator {
    return this.main().getByRole('heading', {
      name: this.t('tarea.misTareas'),
    });
  }

  botonNuevaTarea(): Locator {
    return this.pagina.getByRole('button', { name: this.t('tarea.nuevaTarea') });
  }

  async abrirNuevaTarea(): Promise<void> {
    await this.botonNuevaTarea().click();
  }

  botonExportarCsv(): Locator {
    return this.main().getByRole('button', {
      name: this.t('tarea.exportarCsv'),
    });
  }

  botonExportarJson(): Locator {
    return this.main().getByRole('button', {
      name: this.t('tarea.exportarJson'),
    });
  }

  item(titulo: string): Locator {
    const conTitulo = this.pagina.getByText(titulo, { exact: true });
    return this.lista().getByRole('listitem').filter({ has: conTitulo });
  }

  titulos(): Locator {
    return this.lista().getByRole('listitem').getByRole('heading', { level: 3 });
  }

  botonEditar(titulo: string): Locator {
    return this.item(titulo).getByRole('button', { name: this.t('tarea.editar') });
  }

  botonEliminar(titulo: string): Locator {
    return this.item(titulo).getByRole('button', { name: this.t('tarea.eliminar') });
  }

  botonCompletar(titulo: string): Locator {
    return this.item(titulo).getByRole('button', {
      name: this.t('tarea.marcarCompletada'),
    });
  }

  botonReabrir(titulo: string): Locator {
    return this.item(titulo).getByRole('button', {
      name: this.t('tarea.marcarPendiente'),
    });
  }

  casillaTarea(titulo: string): Locator {
    return this.item(titulo).getByRole('checkbox');
  }

  casillaSeleccionarVisibles(): Locator {
    return this.pagina.getByLabel(this.t('tarea.seleccionarVisibles'));
  }

  resumenSeleccionadas(count: number): Locator {
    return this.pagina.getByText(this.t('tarea.seleccionadas', { count }));
  }

  botonLoteCompletar(): Locator {
    return this.barraLote().getByRole('button', {
      name: this.t('tarea.completar'),
    });
  }

  botonLoteEliminar(): Locator {
    return this.barraLote().getByRole('button', { name: this.t('tarea.eliminar') });
  }

  private barraLote(): Locator {
    return this.pagina.getByRole('group', { name: this.t('tarea.accionesLoteAria') });
  }

  mensajeVacio(): Locator {
    return this.pagina.getByText(this.t('tarea.vacio'));
  }

  buscar(texto: string): Promise<void> {
    return this.controlConClave('tarea.buscarAria').fill(texto);
  }

  botonLimpiar(): Locator {
    return this.pagina.getByRole('button', { name: this.t('tarea.limpiar') });
  }

  async seleccionarPendientes(): Promise<void> {
    await this.controlConClave('tarea.estadoAria').selectOption({
      label: this.t('tarea.pendientes'),
    });
  }

  async seleccionarCompletadas(): Promise<void> {
    await this.controlConClave('tarea.estadoAria').selectOption({
      label: this.t('tarea.completadas'),
    });
  }

  async filtrarPrioridad(prioridad: number): Promise<void> {
    await this.controlConClave('tarea.prioridadAria').selectOption({
      label: this.t(`prioridades.${prioridad}`),
    });
  }

  async filtrarPorCategoria(nombre: string): Promise<void> {
    await this.controlConClave('tarea.categoriaAria').selectOption({
      label: nombre,
    });
  }

  async ordenarPor(campo: CampoOrden, direccion: 'asc' | 'desc'): Promise<void> {
    await this.controlConClave('tarea.ordenarPor').selectOption(campo);
    await this.controlConClave('tarea.direccionAria').selectOption(direccion);
  }

  async presionarAtajo(teclas: string): Promise<void> {
    await this.pagina.keyboard.press(teclas);
  }

  zonaArrastre(zona: 'eliminar' | 'estado'): Locator {
    return this.pagina.locator(`[data-zona="${zona}"]`);
  }

  fantasmaArrastre(): Locator {
    return this.pagina.locator('[data-fantasma="true"]');
  }

  async iniciarArrastre(titulo: string): Promise<void> {
    const caja = await this.item(titulo).boundingBox();
    if (!caja) {
      throw new Error(`No se pudo medir la tarea "${titulo}"`);
    }
    await this.pagina.mouse.move(caja.x + caja.width / 2, caja.y + caja.height / 2);
    await this.pagina.mouse.down();
    await this.pagina.mouse.move(caja.x + caja.width / 2 + 24, caja.y + caja.height / 2, {
      steps: 3,
    });
    await expect(this.fantasmaArrastre()).toBeVisible();
  }

  async moverPunteroA(x: number, y: number): Promise<void> {
    await this.pagina.mouse.move(x, y, { steps: 8 });
  }

  async soltarPuntero(): Promise<void> {
    await this.pagina.mouse.up();
  }

  async arrastrarTareaA(titulo: string, zona: 'eliminar' | 'estado'): Promise<void> {
    await this.iniciarArrastre(titulo);
    const objetivo = this.zonaArrastre(zona);
    await expect(objetivo).toBeVisible();
    const cajaZona = await objetivo.boundingBox();
    if (!cajaZona) {
      throw new Error(`No se pudo medir la zona "${zona}"`);
    }
    await this.moverPunteroA(
      cajaZona.x + cajaZona.width / 2,
      cajaZona.y + cajaZona.height / 2,
    );
    await this.soltarPuntero();
  }
}