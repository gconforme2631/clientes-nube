// Servicio que se comunica con la API REST del backend (la misma de la Unidad 2).
// En el celular, "localhost" es el propio celular: la URL debe usar la IP del computador.
const URL_API = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api/clientes';

export interface Cliente {
  id: number;
  nombre: string;
  correo: string;
  telefono: string | null;
}

export interface NuevoCliente {
  nombre: string;
  correo: string;
  telefono: string;
}

// Error con los mensajes que devuelve la API (400, 404 o 409).
export class ErrorApi extends Error {
  errores: string[];
  constructor(errores: string[]) {
    super(errores.join(' '));
    this.errores = errores;
  }
}

async function solicitar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(URL_API + ruta, {
    ...opciones,
    headers: { 'Content-Type': 'application/json' },
  });
  if (respuesta.status === 204) return undefined as T; // DELETE no devuelve contenido
  const cuerpo = await respuesta.json();
  if (!respuesta.ok) throw new ErrorApi(cuerpo.errores ?? ['Error inesperado del servidor.']);
  return cuerpo as T;
}

export const clienteApi = {
  listar: () => solicitar<Cliente[]>(''),
  agregar: (cliente: NuevoCliente) =>
    solicitar<Cliente>('', { method: 'POST', body: JSON.stringify(cliente) }),
  eliminar: (id: number) => solicitar<void>(`/${id}`, { method: 'DELETE' }),
};