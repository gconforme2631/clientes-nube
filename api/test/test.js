// Pruebas de integración: levantan la API en un puerto libre y la consultan con fetch. 
process.env.DB_ARCHIVO = ':memory:'; // base temporal, no toca clientes.db 
  
const { test, before, after } = require('node:test'); 
const assert = require('node:assert/strict'); 
const app = require('../src/app'); 
  
let servidor; 
let url; 
  
before(() => new Promise((listo) => { 
  servidor = app.listen(0, () => { 
    url = `http://localhost:${servidor.address().port}/api/clientes`; 
    listo(); 
  }); 
})); 
  
after(() => servidor.close()); 
  
const enviar = (cliente) => fetch(url, { 
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' }, 
  body: JSON.stringify(cliente), 
}); 
  
test('POST registra un cliente válido y responde 201', async () => { 
  const respuesta = await enviar({ nombre: 'Ana Pérez', correo: 'ana@utm.edu.ec' }); 
  assert.equal(respuesta.status, 201); 
  const cuerpo = await respuesta.json(); 
  assert.equal(cuerpo.correo, 'ana@utm.edu.ec'); 
}); 
  
test('POST rechaza datos inválidos con 400', async () => { 
  const respuesta = await enviar({ nombre: 'Al', correo: 'sin-arroba' }); 
  assert.equal(respuesta.status, 400); 
  const { errores } = await respuesta.json(); 
  assert.equal(errores.length, 2); 
}); 
  
test('POST rechaza un correo duplicado con 409', async () => { 
  const respuesta = await enviar({ nombre: 'Ana María', correo: 'ANA@utm.edu.ec' }); 
  assert.equal(respuesta.status, 409);
}); 
  
test('GET devuelve la lista de clientes', async () => { 
  const clientes = await (await fetch(url)).json(); 
  assert.equal(clientes.length, 1); 
  assert.equal(clientes[0].nombre, 'Ana Pérez'); 
}); 
  
test('DELETE elimina el cliente y luego responde 404', async () => { 
  const [cliente] = await (await fetch(url)).json(); 
  assert.equal((await fetch(`${url}/${cliente.id}`, { method: 'DELETE' })).status, 204); 
  assert.equal((await fetch(`${url}/${cliente.id}`, { method: 'DELETE' })).status, 404); 
});

test('GET /api/salud responde 200 con estado ok', async () => {
  const respuesta = await fetch(url.replace('/clientes', '/salud'));
  assert.equal(respuesta.status, 200);
  assert.deepEqual(await respuesta.json(), { estado: 'ok' });
});