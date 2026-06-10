import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test DB Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Error connecting to database:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

const REFERENCE_YEAR = 2023;

// Search players
app.get('/api/jugadores', async (req, res) => {
  const term = req.query.search;
  if (!term) return res.json([]);

  try {
    const query = `
      SELECT j.cedula as id, j.nombre, j.apellido, j.fecha_nacimiento, j.foto_url,
             e.nombre_equipo as "equipoActual"
      FROM jugadores j
      LEFT JOIN historial_inscripciones h ON h.cedula_jugador = j.cedula AND h.anio = $3
      LEFT JOIN equipos e ON e.id_equipo = h.id_equipo
      WHERE j.cedula = $1 
         OR UPPER(j.nombre) LIKE UPPER($2) 
         OR UPPER(j.apellido) LIKE UPPER($2)
         OR UPPER(j.nombre || ' ' || j.apellido) LIKE UPPER($2)
      LIMIT 20
    `;
    const val = `%${term}%`;
    const resDb = await pool.query(query, [term, val, REFERENCE_YEAR]);

    const players = [];
    for (const row of resDb.rows) {
      const histRes = await pool.query(`
        SELECT h.anio as "año", e.nombre_equipo || CASE WHEN h.refuerzo = 'SI' THEN ' (Refuerzo)' ELSE '' END as equipo
        FROM historial_inscripciones h
        JOIN equipos e ON e.id_equipo = h.id_equipo
        WHERE h.cedula_jugador = $1
        ORDER BY h.anio DESC
      `, [row.id]);

      let birthdateFormatted = '';
      if (row.fecha_nacimiento) {
        const d = new Date(row.fecha_nacimiento);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        birthdateFormatted = `${day}/${month}/${year}`;
      }

      players.push({
        id: row.id,
        nombre: `${row.nombre} ${row.apellido}`.trim(),
        equipoActual: row.equipoActual || 'Sin Club',
        foto: row.foto_url || `https://api.dicebear.com/7.x/initials/svg?seed=${row.nombre}`,
        fechaNacimiento: birthdateFormatted,
        historial: histRes.rows.map(h => ({
          año: h.año,
          equipo: h.equipo
        }))
      });
    }

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database search error' });
  }
});

// Get all players and history (excluding photos for fast loading) for local device caching
app.get('/api/jugadores/todos', async (req, res) => {
  try {
    const playersQuery = `
      SELECT j.cedula as id, j.nombre, j.apellido, j.fecha_nacimiento,
             e.nombre_equipo as "equipoActual"
      FROM jugadores j
      LEFT JOIN historial_inscripciones h ON h.cedula_jugador = j.cedula AND h.anio = $1
      LEFT JOIN equipos e ON e.id_equipo = h.id_equipo
    `;
    const playersRes = await pool.query(playersQuery, [REFERENCE_YEAR]);

    const historyQuery = `
      SELECT h.cedula_jugador, h.anio as "año", e.nombre_equipo || CASE WHEN h.refuerzo = 'SI' THEN ' (Refuerzo)' ELSE '' END as equipo
      FROM historial_inscripciones h
      JOIN equipos e ON e.id_equipo = h.id_equipo
      ORDER BY h.anio DESC
    `;
    const historyRes = await pool.query(historyQuery);

    const historyMap = {};
    for (const row of historyRes.rows) {
      if (!historyMap[row.cedula_jugador]) {
        historyMap[row.cedula_jugador] = [];
      }
      historyMap[row.cedula_jugador].push({
        año: row.año,
        equipo: row.equipo
      });
    }

    const players = playersRes.rows.map(row => {
      let birthdateFormatted = '';
      if (row.fecha_nacimiento) {
        const d = new Date(row.fecha_nacimiento);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        birthdateFormatted = `${day}/${month}/${year}`;
      }

      return {
        id: row.id,
        nombre: `${row.nombre} ${row.apellido}`.trim(),
        equipoActual: row.equipoActual || 'Sin Club',
        fechaNacimiento: birthdateFormatted,
        historial: historyMap[row.id] || []
      };
    });

    res.json(players);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database fetch error' });
  }
});

// Get all clubs
app.get('/api/equipos', async (req, res) => {
  try {
    const resDb = await pool.query('SELECT nombre_equipo as nombre FROM equipos ORDER BY nombre_equipo');
    
    const initialClubes = [
      { nombre: "Avaroa", logo: "/logos/avaroa.png" },
      { nombre: "Bush Vinto", logo: "/logos/bush-vinto.png" },
      { nombre: "Peñarol", logo: "/logos/peñarol.png" },
      { nombre: "Bush Vinto Junior", logo: "/logos/bush-vinto-junior.png" },
      { nombre: "Millonarios", logo: "/logos/millonarios.png" },
      { nombre: "Amanecer", logo: "/logos/amanecer.png" },
      { nombre: "J Yana", logo: "/logos/j-yana.png" },
      { nombre: "The Strongest", logo: "/logos/the-strongest.png" },
      { nombre: "Olimpic", logo: "/logos/olimpic.png" },
      { nombre: "Deportivo Kali", logo: "/logos/deportivo-kali.png" }
    ];

    const response = resDb.rows.map(r => {
      const matched = initialClubes.find(c => 
        r.nombre.toUpperCase().includes(c.nombre.toUpperCase())
      );
      return {
        nombre: r.nombre,
        logo: matched ? matched.logo : null
      };
    });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database teams fetch error' });
  }
});

// Perform transfer
app.post('/api/traspaso', async (req, res) => {
  const { cedula, targetTeamName, actionType, loanPeriod } = req.body;
  if (!cedula || !targetTeamName || !actionType) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    await pool.query('BEGIN');

    const teamRes = await pool.query('SELECT id_equipo FROM equipos WHERE nombre_equipo = $1', [targetTeamName]);
    if (teamRes.rows.length === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ error: 'Target team not found' });
    }
    const targetTeamId = teamRes.rows[0].id_equipo;
    const currentYear = REFERENCE_YEAR;
    const reinforcement = actionType === 'pase' ? 'NO' : 'SI';

    const checkRes = await pool.query(`
      SELECT id_inscripcion FROM historial_inscripciones 
      WHERE cedula_jugador = $1 AND anio = $2
    `, [cedula, currentYear]);

    if (checkRes.rows.length > 0) {
      await pool.query(`
        UPDATE historial_inscripciones 
        SET id_equipo = $1, refuerzo = $2
        WHERE cedula_jugador = $3 AND anio = $4
      `, [targetTeamId, reinforcement, cedula, currentYear]);
    } else {
      await pool.query(`
        INSERT INTO historial_inscripciones (cedula_jugador, id_equipo, anio, refuerzo)
        VALUES ($1, $2, $3, $4)
      `, [cedula, targetTeamId, currentYear, reinforcement]);
    }

    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Database error during transfer' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    let normalizedEmail = email.trim().toLowerCase();
    if (normalizedEmail === 'admin.ligadefutbolvinto.com') {
      normalizedEmail = 'admin@ligadefutbolvinto.com';
    }
    const query = 'SELECT id_usuario, email, password_hash, rol, id_equipo FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [normalizedEmail]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const user = result.rows[0];
    if (user.password_hash !== password) {
      return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    res.json({
      success: true,
      user: {
        id: user.id_usuario,
        email: user.email,
        rol: user.rol,
        id_equipo: user.id_equipo
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor al autenticar' });
  }
});

export default app;
