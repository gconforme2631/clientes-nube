// Define la API REST: rutas, validación y códigos de estado HTTP. 
const express = require('express'); 
const cors = require('cors'); 
const db = require('./db'); 
const { validarCliente } = require('./validaciones'); 
  
// Orígenes permitidos por CORS: se configuran con la variable CORS_ORIGINS 
// (separados por comas). Por defecto: Angular y Expo web en el computador. 
const ORIGENES_LOCALES = 'http://localhost:4200,http://localhost:8081'; 
const ORIGENES = (process.env.CORS_ORIGINS ?? ORIGENES_LOCALES) 
  .split(',') 
  .map((origen) => origen.trim()); 
  
const app = express(); 
app.use(cors({ origin: ORIGENES })); 
app.use(express.json()); 
  
// GET /api/salud → la plataforma comprueba que la API está activa 
app.get('/api/salud', (_req, res) => { 
  res.json({ estado: 'ok' }); 
}); 
  
// GET /api/clientes → lista de clientes 
app.get('/api/clientes', async (_req, res) => { 
  res.json(await db.listar()); 
}); 
  
// POST /api/clientes → registra un cliente 
app.post('/api/clientes', async (req, res) => { 
  const { valido, errores, datos } = validarCliente(req.body); 
  if (!valido) return res.status(400).json({ errores }); 
  try { 
    const id = await db.agregar(datos); 
    res.status(201).json({ id, ...datos }); 
  } catch (error) { 
    if (error.duplicado) { 
      return res.status(409).json({ errores: ['El correo ya está registrado.'] }); 
    } 
    throw error; 
  } 
}); 
  
// DELETE /api/clientes/:id → elimina un cliente 
app.delete('/api/clientes/:id', async (req, res) => { 
  const eliminados = await db.eliminar(Number(req.params.id)); 
  if (eliminados === 0) { 
    return res.status(404).json({ errores: ['Cliente no encontrado.'] }); 
  } 
  res.status(204).end(); 
}); 
  
module.exports = app;