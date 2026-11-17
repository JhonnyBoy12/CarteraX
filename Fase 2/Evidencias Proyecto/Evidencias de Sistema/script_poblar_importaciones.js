/**
 * Simula la importación de una cartera Excel utilizando
 * el importador real de CarteraX.
 *
 * Los datos se almacenan en una base de demostración
 * independiente de la base de datos principal.
 *
 * Uso:
 * npm run poblar:cartera
 *
 * También permite indicar otro archivo:
 * npm run poblar:cartera -- "C:\ruta\cartera.xlsx"
 */

const path = require('node:path');
const fs = require('node:fs');

const {
    obtenerConexion,
    cerrarConexion
} = require('../dist/db/conexion');

const {
    importarArchivo
} = require('../dist/importacion/importador');

const {
    idPeriodo
} = require('../dist/servicios/servicioPeriodos');

// Configuración de rutas.
const directorioProyecto = path.join(__dirname, '..');

const rutaDb = path.join(
    directorioProyecto,
    'datos',
    'carterax-demo.db'
);

const archivoPredeterminado = path.join(
    directorioProyecto,
    'ejemplos',
    'cartera_ejemplo.xlsx'
);

// Permite utilizar un Excel personalizado.
const rutaArchivo = process.argv[2]
    ? path.resolve(process.cwd(), process.argv[2])
    : archivoPredeterminado;

const emailDemo = 'demo@carterax.cl';

try {

    // Comprueba que exista la base de demostración.
    if (!fs.existsSync(rutaDb)) {
        throw new Error(
            'No existe la base de demostración. ' +
            'Ejecuta primero: npm run poblar:usuario'
        );
    }

    // Comprueba que exista el Excel.
    if (!fs.existsSync(rutaArchivo)) {
        throw new Error(
            `No se encontró el archivo Excel: ${rutaArchivo}`
        );
    }

    const db = obtenerConexion(rutaDb);

    // Recupera el identificador del ejecutivo.
    const usuario = db.prepare(`
        SELECT id
        FROM usuarios
        WHERE lower(email) = lower(?)
    `).get(emailDemo);

    if (!usuario) {
        throw new Error(
            `No existe el usuario ${emailDemo}. ` +
            'Ejecuta primero: npm run poblar:usuario'
        );
    }

    // Define el contexto de importación.
    const contexto = {
        usuarioId: usuario.id,
        periodoId: idPeriodo()
    };

    console.log('Iniciando importación de demostración...');
    console.log(`Archivo: ${path.basename(rutaArchivo)}`);

    // Ejecuta el importador original de CarteraX.
    const resultado = importarArchivo(
        db,
        rutaArchivo,
        contexto,
        path.basename(rutaArchivo)
    );

    // Variables para los resultados generales.
    let totalCargados = 0;
    let totalCorregidos = 0;
    let totalErrores = 0;

    console.log('\nRESULTADO DE LA IMPORTACIÓN');

    // Presenta los resultados de cada hoja.
    for (const hoja of resultado.hojas) {

        console.log(`\nHoja: ${hoja.hoja}`);
        console.log(`Registros importados: ${hoja.cargados}`);
        console.log(`Registros corregidos: ${hoja.corregidos}`);
        console.log(`Registros con error: ${hoja.conError}`);

        totalCargados += hoja.cargados;
        totalCorregidos += hoja.corregidos;
        totalErrores += hoja.conError;
    }

    // Resumen final.
    console.log('\nRESUMEN GENERAL');

    console.log(`Total importados: ${totalCargados}`);
    console.log(`Total corregidos: ${totalCorregidos}`);
    console.log(`Total con errores: ${totalErrores}`);

    console.log(`Período: ${contexto.periodoId}`);
    console.log(`Base de datos: ${rutaDb}`);

    console.log('\nProceso de importación finalizado.');

} catch (error) {

    console.error(
        '\nNo fue posible realizar la importación:',
        error.message
    );

    process.exitCode = 1;

} finally {
    cerrarConexion();
}