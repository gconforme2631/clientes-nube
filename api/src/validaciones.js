// Reglas de validación de un cliente. Se ejecutan en el proceso principal. 
const PATRON_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
const PATRON_TELEFONO = /^0\d{9}$/; // 10 dígitos, inicia con 0 
  
function validarCliente(cliente = {}) { 
  const datos = { 
    nombre: String(cliente.nombre ?? '').trim(), 
    correo: String(cliente.correo ?? '').trim().toLowerCase(), 
    telefono: String(cliente.telefono ?? '').trim(), 
  }; 
  const errores = []; 
  if (datos.nombre.length < 3) { 
    errores.push('El nombre debe tener al menos 3 caracteres.'); 
  } 
  if (!PATRON_CORREO.test(datos.correo)) { 
    errores.push('El correo electrónico no es válido.'); 
  } 
  if (datos.telefono && !PATRON_TELEFONO.test(datos.telefono)) { 
    errores.push('El teléfono debe tener 10 dígitos y empezar con 0.'); 
  } 
  return { valido: errores.length === 0, errores, datos }; 
} 
  
module.exports = { validarCliente }; 