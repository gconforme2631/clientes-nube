// Define la API REST: rutas, validación y códigos de estado HTTP. 
const express = require('express'); 
const cors = require('cors'); 
const db = require('./db'); 
const { validarCliente } = require('./validaciones'); 
  
const SQLITE_CONSTRAINT_UNIQUE = 2067; // código de SQLite para un valor duplicado 
  
const app = express(); 
app.use(cors({ origin: 'http://localhost:4200' })); // solo el frontend de Angular 
app.use(express.json()); 
  
// GET /api/clientes → lista de clientes 
app.get('/api/clientes', (_req, res) => { 
  res.json(db.listar()); 
}); 
  
// POST /api/clientes → registra un cliente 
app.post('/api/clientes', (req, res) => { 
  const { valido, errores, datos } = validarCliente(req.body); 
  if (!valido) return res.status(400).json({ errores }); 
  try { 
    const id = db.agregar(datos); 
    res.status(201).json({ id, ...datos }); 
  } catch (error) { 
    if (error.errcode === SQLITE_CONSTRAINT_UNIQUE) { 
      return res.status(409).json({ errores: ['El correo ya está registrado.'] }); 
    } 
    throw error; 
  } 
}); 
  
// DELETE /api/clientes/:id → elimina un cliente 
app.delete('/api/clientes/:id', (req, res) => { 
  const eliminados = db.eliminar(Number(req.params.id)); 
  if (eliminados === 0) return res.status(404).json({ errores: ['Cliente no encontrado.'] 
}); 
  res.status(204).end(); 
}); 
  
module.exports = app; 