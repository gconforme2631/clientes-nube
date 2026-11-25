// Pantalla principal: registra, lista y elimina clientes consumiendo la API REST.
import { useCallback, useEffect, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Cliente, ErrorApi, NuevoCliente, clienteApi } from './src/cliente-api';

const VACIO: NuevoCliente = { nombre: '', correo: '', telefono: '' };

type Mensaje = { texto: string; error: boolean } | null;

export default function App() {
  return (
    <SafeAreaProvider>
      <PantallaClientes />
    </SafeAreaProvider>
  );
}

function PantallaClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [formulario, setFormulario] = useState<NuevoCliente>(VACIO);
  const [mensaje, setMensaje] = useState<Mensaje>(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const mostrarError = (error: unknown) => {
    const texto = error instanceof ErrorApi
      ? error.errores.join('\n')
      : 'No se pudo conectar con la API. Revise la URL del archivo .env y que el servidor esté activo.';
    setMensaje({ texto, error: true });
  };

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      setClientes(await clienteApi.listar());
    } catch (error) {
      mostrarError(error);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const guardar = async () => {
    setGuardando(true);
    try {
      const nuevo = await clienteApi.agregar(formulario);
      setFormulario(VACIO);
      setMensaje({ texto: `Cliente ${nuevo.nombre} registrado.`, error: false });
      await cargar();
    } catch (error) {
      mostrarError(error);
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = async (cliente: Cliente) => {
    try {
      await clienteApi.eliminar(cliente.id);
      setMensaje({ texto: `Cliente ${cliente.nombre} eliminado.`, error: false });
      await cargar();
    } catch (error) {
      mostrarError(error);
    }
  };

  // Actualiza un campo del formulario sin perder los demás.
  const cambiar = (campo: keyof NuevoCliente) => (texto: string) =>
    setFormulario((actual) => ({ ...actual, [campo]: texto }));

  const encabezado = (
    <View>
      <Text style={estilos.titulo} accessibilityRole="header">Registro de clientes</Text>

      <Text style={estilos.etiqueta}>Nombre completo</Text>
      <TextInput
        style={estilos.campo}
        value={formulario.nombre}
        onChangeText={cambiar('nombre')}
        accessibilityLabel="Nombre completo"
        autoCapitalize="words"
      />

      <Text style={estilos.etiqueta}>Correo electrónico</Text>
      <TextInput
        style={estilos.campo}
        value={formulario.correo}
        onChangeText={cambiar('correo')}
        accessibilityLabel="Correo electrónico"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={estilos.etiqueta}>Teléfono (opcional)</Text>
      <TextInput
        style={estilos.campo}
        value={formulario.telefono}
        onChangeText={cambiar('telefono')}
        accessibilityLabel="Teléfono, opcional"
        keyboardType="phone-pad"
        placeholder="0991234567"
        maxLength={10}
      />

      <Pressable
        style={({ pressed }) => [estilos.boton, (pressed || guardando) && estilos.botonPresionado]}
        onPress={guardar}
        disabled={guardando}
        accessibilityRole="button"
        accessibilityLabel="Guardar cliente"
      >
        <Text style={estilos.textoBoton}>{guardando ? 'Guardando…' : 'Guardar cliente'}</Text>
      </Pressable>

      {mensaje && (
        <Text
          style={[estilos.mensaje, mensaje.error ? estilos.mensajeError : estilos.mensajeExito]}
          accessibilityLiveRegion="polite"
        >
          {mensaje.texto}
        </Text>
      )}

      <Text style={estilos.subtitulo}>Clientes registrados ({clientes.length})</Text>
    </View>
  );

  return (
    <SafeAreaView style={estilos.pantalla}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={estilos.pantalla} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <FlatList
          data={clientes}
          keyExtractor={(cliente) => String(cliente.id)}
          ListHeaderComponent={encabezado}
          ListEmptyComponent={<Text style={estilos.vacio}>Aún no hay clientes registrados.</Text>}
          refreshing={cargando}
          onRefresh={cargar}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={estilos.contenido}
          renderItem={({ item }) => (
            <View style={estilos.tarjeta}>
              <View style={estilos.datos}>
                <Text style={estilos.nombre}>{item.nombre}</Text>
                <Text style={estilos.detalle}>{item.correo}</Text>
                <Text style={estilos.detalle}>{item.telefono ?? 'Sin teléfono'}</Text>
              </View>
              <Pressable
                style={estilos.botonEliminar}
                onPress={() => eliminar(item)}
                accessibilityRole="button"
                accessibilityLabel={`Eliminar a ${item.nombre}`}
              >
                <Text style={estilos.textoEliminar}>Eliminar</Text>
              </Pressable>
            </View>
          )}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const VERDE = '#2E7D32';

const estilos = StyleSheet.create({
  pantalla: { flex: 1, backgroundColor: '#F7FBF7' },
  contenido: { padding: 20, paddingBottom: 40 },
  titulo: { fontSize: 26, fontWeight: '700', color: VERDE, marginBottom: 16 },
  etiqueta: { fontSize: 16, fontWeight: '600', color: '#1F2933', marginTop: 12, marginBottom: 6 },
  campo: { minHeight: 48, borderWidth: 1, borderColor: '#6B7B6F', borderRadius: 8, paddingHorizontal: 12, fontSize: 16, backgroundColor: '#FFFFFF' },
  boton: { minHeight: 48, marginTop: 20, borderRadius: 8, backgroundColor: VERDE, alignItems: 'center', justifyContent: 'center' },
  botonPresionado: { opacity: 0.7 },
  textoBoton: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
  mensaje: { marginTop: 14, padding: 12, borderRadius: 8, fontSize: 15 },
  mensajeExito: { backgroundColor: '#DCEDDE', color: '#1B5E20' },
  mensajeError: { backgroundColor: '#FDECEA', color: '#B71C1C' },
  subtitulo: { fontSize: 18, fontWeight: '700', color: '#1F2933', marginTop: 24, marginBottom: 8 },
  vacio: { fontSize: 15, color: '#66737A', fontStyle: 'italic' },
  tarjeta: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#DCEDDE' },
  datos: { flex: 1 },
  nombre: { fontSize: 17, fontWeight: '700', color: '#1F2933' },
  detalle: { fontSize: 15, color: '#3A4750', marginTop: 2 },
  botonEliminar: { minHeight: 48, minWidth: 48, paddingHorizontal: 14, borderRadius: 8, backgroundColor: '#B71C1C', alignItems: 'center', justifyContent: 'center' },
  textoEliminar: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
});