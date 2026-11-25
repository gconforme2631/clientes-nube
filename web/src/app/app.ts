// Componente principal: formulario, mensajes y tabla de clientes. 
import { Component, OnInit, inject, signal } from '@angular/core'; 
import { HttpErrorResponse } from '@angular/common/http'; 
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'; 
import { Cliente, ClienteApi } from './cliente-api'; 
  
@Component({ 
  selector: 'app-root', 
  imports: [ReactiveFormsModule], 
  templateUrl: './app.html', 
  styleUrl: './app.css', 
}) 
export class App implements OnInit { 
  private readonly api = inject(ClienteApi); 
  private readonly fb = inject(FormBuilder); 
  
  protected readonly clientes = signal<Cliente[]>([]); 
  protected readonly mensaje = signal(''); 
  protected readonly esError = signal(false); 
  
  protected readonly formulario = this.fb.nonNullable.group({ 
    nombre: '', 
    correo: '', 
    telefono: '', 
  }); 
  
  ngOnInit() { 
    this.cargar(); 
  } 
  
  protected cargar() { 
    this.api.listar().subscribe({ 
      next: (datos) => this.clientes.set(datos), 
      error: () => this.mostrar('No se pudo conectar con la API. Verifique que esté en ejecución.', true), 
    }); 
  } 
  
  protected guardar() { 
    this.api.agregar(this.formulario.getRawValue()).subscribe({ 
      next: () => { 
        this.formulario.reset(); 
        this.mostrar('Cliente registrado correctamente.', false); 
        this.cargar(); 
      }, 
      error: (respuesta: HttpErrorResponse) => 
        this.mostrar(respuesta.error?.errores?.join(' ') ?? 'Ocurrió un error inesperado.', 
true), 
    }); 
  } 
  
  protected eliminar(cliente: Cliente) { 
    this.api.eliminar(cliente.id).subscribe(() => { 
      this.mostrar(`Se eliminó a ${cliente.nombre}.`, false); 
      this.cargar(); 
    }); 
  } 
  
  private mostrar(texto: string, error: boolean) { 
    this.mensaje.set(texto); 
    this.esError.set(error); 
  } 
}