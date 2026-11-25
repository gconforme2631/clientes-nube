// Acceso a datos con el SQLite integrado en Node.js (no requiere instalar paquetes). 
const path = require('node:path'); 
const { DatabaseSync } = require('node:sqlite'); 
  
const archivo = process.env.DB_ARCHIVO ?? path.join(__dirname, '..', 'clientes.db'); 
const db = new DatabaseSync(archivo); 
  
db.exec(`CREATE TABLE IF NOT EXISTS clientes ( 
  id INTEGER PRIMARY KEY AUTOINCREMENT, 
  nombre TEXT NOT NULL, 
  correo TEXT NOT NULL UNIQUE, 
  telefono TEXT 
)`); 
  
const listar = () => 
  db.prepare('SELECT id, nombre, correo, telefono FROM clientes ORDER BY nombre').all(); 
  
const agregar = ({ nombre, correo, telefono }) => { 
  const resultado = db 
    .prepare('INSERT INTO clientes (nombre, correo, telefono) VALUES (?, ?, ?)') 
    .run(nombre, correo, telefono || null); 
  return Number(resultado.lastInsertRowid); 
}; 
  
const eliminar = (id) => 
  Number(db.prepare('DELETE FROM clientes WHERE id = ?').run(id).changes); 
  
module.exports = { listar, agregar, eliminar };