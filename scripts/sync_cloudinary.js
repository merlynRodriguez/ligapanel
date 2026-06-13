import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Inicializar base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL && process.env.DATABASE_URL.includes('neon.tech') ? {
    rejectUnauthorized: false
  } : undefined
});

// Credenciales de Cloudinary
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Error: Faltan credenciales de Cloudinary en el archivo .env.');
  console.error('Por favor configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY y CLOUDINARY_API_SECRET.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('Error: Falta la variable DATABASE_URL en el archivo .env.');
  process.exit(1);
}

// Generar cabecera de autenticación básica para la Admin API de Cloudinary
const authHeader = 'Basic ' + Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

async function fetchCloudinaryImages(nextCursor = null) {
  let url = `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=500`;
  if (nextCursor) {
    url += `&next_cursor=${nextCursor}`;
  }

  console.log(`Obteniendo recursos de Cloudinary (Cursor: ${nextCursor || 'inicio'})...`);
  const response = await fetch(url, {
    headers: {
      'Authorization': authHeader
    }
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error de Cloudinary API (${response.status}): ${errorText}`);
  }

  return await response.json();
}

async function runSync() {
  let client;
  try {
    // Conectar a la DB
    client = await pool.connect();
    console.log('Conectado a la base de datos Neon PostgreSQL.');

    let nextCursor = null;
    let totalImagesProcessed = 0;
    let matchedCount = 0;
    let unmatchedCount = 0;
    let updatedCount = 0;

    // Obtener la lista de todos los jugadores de la base de datos para búsqueda rápida en memoria
    console.log('Obteniendo lista de jugadores de la base de datos...');
    const dbPlayersRes = await client.query('SELECT cedula, nombre, apellido, foto_url FROM jugadores');
    const playersMap = {};
    for (const player of dbPlayersRes.rows) {
      // Normalizamos la cédula como llave: sin espacios y en mayúsculas
      const key = String(player.cedula).trim().toUpperCase();
      playersMap[key] = player;
    }
    console.log(`Se cargaron ${dbPlayersRes.rowCount} jugadores de la base de datos.`);

    let hasMore = true;

    while (hasMore) {
      const data = await fetchCloudinaryImages(nextCursor);
      const resources = data.resources || [];
      console.log(`Se recibieron ${resources.length} imágenes en esta página.`);

      for (const res of resources) {
        totalImagesProcessed++;
        
        // El public_id puede incluir carpetas, ej. "carpeta/88150889_afe49z"
        const publicId = res.public_id;
        const filename = publicId.split('/').pop(); // "88150889_afe49z"
        
        // El carnet es el texto antes del guion bajo "_"
        // Si no tiene guion bajo, tomamos el filename completo
        const carnetRaw = filename.split('_')[0];
        const carnet = carnetRaw.trim().toUpperCase();

        const secureUrl = res.secure_url;

        // Comprobar si existe un jugador con ese carnet
        const matchingPlayer = playersMap[carnet];

        if (matchingPlayer) {
          matchedCount++;
          // Solo actualizamos si la URL en la DB es diferente de la URL de Cloudinary
          if (matchingPlayer.foto_url !== secureUrl) {
            try {
              await client.query(
                'UPDATE jugadores SET foto_url = $1 WHERE cedula = $2',
                [secureUrl, matchingPlayer.cedula]
              );
              updatedCount++;
              console.log(`[OK] Actualizado carnet ${carnet} (${matchingPlayer.nombre} ${matchingPlayer.apellido}) -> ${secureUrl}`);
            } catch (err) {
              console.error(`[ERROR] Falló actualización en DB para carnet ${carnet}:`, err.message);
            }
          } else {
            console.log(`[SKIP] Carnet ${carnet} ya tiene la URL correcta configurada.`);
          }
        } else {
          unmatchedCount++;
          console.log(`[INFO] Foto de Cloudinary sin jugador coincidente en la DB: ID: ${publicId} (Carnet deducido: ${carnet})`);
        }
      }

      nextCursor = data.next_cursor;
      hasMore = !!nextCursor;
    }

    console.log('\n==================================================');
    console.log('PROCESO DE SINCRONIZACIÓN COMPLETADO');
    console.log('==================================================');
    console.log(`Total fotos procesadas de Cloudinary: ${totalImagesProcessed}`);
    console.log(`Fotos emparejadas con jugadores:       ${matchedCount}`);
    console.log(`Fotos no emparejadas:                  ${unmatchedCount}`);
    console.log(`Registros de jugadores actualizados:   ${updatedCount}`);
    console.log('==================================================\n');

  } catch (err) {
    console.error('Error durante la sincronización:', err);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

runSync();
