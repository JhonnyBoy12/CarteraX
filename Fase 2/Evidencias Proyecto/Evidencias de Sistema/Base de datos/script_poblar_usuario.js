/**
 * Crea un usuario ejecutivo de demostración.
 * La contraseña se almacena mediante scrypt, nunca en texto plano.
 *
 * Uso: npm run poblar:usuario
 */

const path = require('node:path');
const fs = require('node:fs');
const { randomUUID, randomBytes, scryptSync } = require('node:crypto');

const {
    obtenerConexion,
    cerrarConexion
} = require('../dist/db/conexion');

const directorioDatos = path.join(__dirname, '..', 'datos');
const rutaDb = path.join(directorioDatos, 'carterax-demo.db');

const usuarioDemo = {
    nombre: 'Ejecutivo',
    apellido: 'Demostración',
    email: 'demo@carterax.cl',
    password: 'DemoCartera2026!'
};

/**
 * Genera un hash seguro utilizando scrypt.
 */
function crearHash(password) {
    const sal = randomBytes(16);
    const hash = scryptSync(password, sal, 64);

    return `scrypt:${sal.toString('hex')}:${hash.toString('hex')}`;
}

try {
    // Crea la carpeta de datos si todavía no existe.
    fs.mkdirSync(directorioDatos, { recursive: true });

    const db = obtenerConexion(rutaDb);

    // Comprueba si el usuario ya fue creado.
    const existente = db.prepare(`
        SELECT id
        FROM usuarios
        WHERE lower(email) = lower(?)
    `).get(usuarioDemo.email);

    if (existente) {
        console.log('El usuario de demostración ya existe.');
    } else {
        // Registra el ejecutivo en la base de datos.
        db.prepare(`
            INSERT INTO usuarios (
                id,
                nombre,
                apellido,
                email,
                password_hash,
                activo
            )
            VALUES (?, ?, ?, ?, ?, 1)
        `).run(
            randomUUID(),
            usuarioDemo.nombre,
            usuarioDemo.apellido,
            usuarioDemo.email,
            crearHash(usuarioDemo.password)
        );

        console.log('Usuario de demostración creado correctamente.');
    }

    console.log('\nCredenciales de acceso:');
    console.log(`Correo: ${usuarioDemo.email}`);
    console.log(`Contraseña: ${usuarioDemo.password}`);
    console.log(`Base de datos: ${rutaDb}`);

} catch (error) {
    console.error(
        'No fue posible crear el usuario:',
        error.message
    );

    process.exitCode = 1;

} finally {
    cerrarConexion();
}