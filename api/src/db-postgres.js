// Acceso a datos con PostgreSQL (servicio gestionado en la nube o contenedor local).
const { Pool } = require('pg');

const UNIQUE_VIOLATION = '23505'; // código de PostgreSQL para un valor duplicado

// La cadena de conexión llega por variable de entorno: nunca se escribe en el código.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Crea la tabla al iniciar, si no existe.
const listo = pool.query(`CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  telefono TEXT
)`);
listo.catch((error) => console.error('No se pudo preparar PostgreSQL:', error.message));

const listar = async () => {
  await listo;
  const { rows } = await pool.query(
    'SELECT id, nombre, correo, telefono FROM clientes ORDER BY nombre',
  );
  return rows;
};

const agregar = async ({ nombre, correo, telefono }) => {
  await listo;
  try {
    const { rows } = await pool.query(
      'INSERT INTO clientes (nombre, correo, telefono) ' +
        'VALUES ($1, $2, $3) RETURNING id',
      [nombre, correo, telefono || null],
    );
    return rows[0].id;
  } catch (error) {
    if (error.code === UNIQUE_VIOLATION) error.duplicado = true;
    throw error;
  }
};

const eliminar = async (id) => {
  await listo;
  const { rowCount } = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  return rowCount;
};

module.exports = { listar, agregar, eliminar };