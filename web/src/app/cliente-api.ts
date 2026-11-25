// Servicio que se comunica con la API REST del backend. 
import { Injectable, inject } from '@angular/core'; 
import { HttpClient } from '@angular/common/http'; 
  
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
  
@Injectable({ providedIn: 'root' }) 
export class ClienteApi { 
  private readonly http = inject(HttpClient); 
  private readonly url = 'http://localhost:3000/api/clientes'; 
  
  listar() { 
    return this.http.get<Cliente[]>(this.url); 
  } 
  
  agregar(cliente: NuevoCliente) { 
    return this.http.post<Cliente>(this.url, cliente); 
  } 
  
  eliminar(id: number) { 
    return this.http.delete<void>(`${this.url}/${id}`); 
  } 
}