// Acceso a datos con el SQLite integrado en Node.js (desarrollo local y pruebas). 
const path = require('node:path'); 
const { DatabaseSync } = require('node:sqlite'); 
  
const SQLITE_CONSTRAINT_UNIQUE = 2067; // código de SQLite para un valor duplicado 
  
const archivo = process.env.DB_ARCHIVO ?? path.join(__dirname, '..', 'clientes.db'); 
const db = new DatabaseSync(archivo); 
  
db.exec(`CREATE TABLE IF NOT EXISTS clientes ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  nombre TEXT NOT NULL, 
  correo TEXT NOT NULL UNIQUE, 
  telefono TEXT 
)`); 
  
// Las funciones son async para ofrecer la misma interfaz que PostgreSQL. 
const listar = async () => 
  db.prepare('SELECT id, nombre, correo, telefono FROM clientes ORDER BY nombre').all(); 
  
const agregar = async ({ nombre, correo, telefono }) => { 
  try { 
    const resultado = db 
      .prepare('INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)') 
      .run(nombre, correo, telefono || null); 
    return Number(resultado.lastInsertRowid); 
  } catch (error) { 
    if (error.errcode === SQLITE_CONSTRAINT_UNIQUE) error.duplicado = true; 
    throw error; 
  } 
}; 
  
const eliminar = async (id) => 
  Number(db.prepare('DELETE FROM clientes WHERE id = ?').run(id).changes); 
  
module.exports = { listar, agregar, eliminar }; 