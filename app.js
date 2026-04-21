const express = require("express");
const app = express();
const db = require("./db");

app.use(express.json());

// Ruta base
app.get("/", (req, res) => {
  res.send("API funcionando");
});

// =====================
// USUARIOS (CRUD)
// =====================

// GET - listar usuarios
app.get("/usuarios", (req, res) => {
  db.query("SELECT * FROM usuarios", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST - crear usuario
app.post("/usuarios", (req, res) => {
  const { nombre, correo } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql = "INSERT INTO usuarios (nombre, correo, fecha_registro) VALUES (?, ?, NOW())";

  db.query(sql, [nombre, correo], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Usuario creado" });
  });
});

// PUT - actualizar usuario
app.put("/usuarios/:id", (req, res) => {
  const { id } = req.params;
  const { nombre, correo } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql = "UPDATE usuarios SET nombre = ?, correo = ? WHERE id_usuario = ?";

  db.query(sql, [nombre, correo, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Usuario actualizado" });
  });
});

// DELETE - eliminar usuario
app.delete("/usuarios/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM usuarios WHERE id_usuario = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Usuario eliminado" });
  });
});

// Servidor
app.listen(4000, () => {
  console.log("Servidor corriendo en puerto 4000");
});

// =====================
// LIBROS (CRUD)
// =====================

// GET - listar libros
app.get("/libros", (req, res) => {
  db.query("SELECT * FROM libros", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// POST - crear libro
app.post("/libros", (req, res) => {
  const { titulo, autor, categoria } = req.body;

  if (!titulo || !autor || !categoria) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  const sql = "INSERT INTO libros (titulo, autor, categoria, disponibilidad) VALUES (?, ?, ?, true)";

  db.query(sql, [titulo, autor, categoria], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Libro creado" });
  });
});

// PUT - actualizar libro
app.put("/libros/:id", (req, res) => {
  const { id } = req.params;
  const { titulo, autor, categoria, disponibilidad } = req.body;

  const sql = "UPDATE libros SET titulo = ?, autor = ?, categoria = ?, disponibilidad = ? WHERE id_libro = ?";

  db.query(sql, [titulo, autor, categoria, disponibilidad, id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Libro actualizado" });
  });
});

// DELETE - eliminar libro
app.delete("/libros/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM libros WHERE id_libro = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ mensaje: "Libro eliminado" });
  });
});
// =====================
// PRESTAMOS
// =====================

// GET - listar préstamos (con info de usuario y libro)
app.get("/prestamos", (req, res) => {
  const sql = `
    SELECT p.id_prestamo, u.nombre AS usuario, l.titulo AS libro,
           p.fecha_prestamo, p.fecha_devolucion
    FROM prestamos p
    JOIN usuarios u ON p.id_usuario = u.id_usuario
    JOIN libros l ON p.id_libro = l.id_libro
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});


// POST - crear préstamo (con validación)
app.post("/prestamos", (req, res) => {
  const { id_usuario, id_libro } = req.body;

  if (!id_usuario || !id_libro) {
    return res.status(400).json({ error: "Datos incompletos" });
  }

  // 1. Verificar si el libro existe y está disponible
  const checkSql = "SELECT disponibilidad FROM libros WHERE id_libro = ?";

  db.query(checkSql, [id_libro], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ error: "Libro no existe" });
    }

    if (!results[0].disponibilidad) {
      return res.status(400).json({ error: "Libro no disponible" });
    }

    // 2. Crear préstamo
    const insertSql = `
      INSERT INTO prestamos (id_usuario, id_libro, fecha_prestamo)
      VALUES (?, ?, NOW())
    `;

    db.query(insertSql, [id_usuario, id_libro], (err, result) => {
      if (err) return res.status(500).json(err);

      // 3. Marcar libro como NO disponible
      const updateSql = "UPDATE libros SET disponibilidad = false WHERE id_libro = ?";

      db.query(updateSql, [id_libro], (err2) => {
        if (err2) return res.status(500).json(err2);

        res.json({ mensaje: "Préstamo registrado" });
      });
    });
  });
});


// PUT - devolver libro
app.put("/prestamos/devolver/:id", (req, res) => {
  const { id } = req.params;

  // 1. Obtener el préstamo
  const getSql = "SELECT id_libro FROM prestamos WHERE id_prestamo = ?";

  db.query(getSql, [id], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(404).json({ error: "Préstamo no existe" });
    }

    const id_libro = results[0].id_libro;

    // 2. Actualizar fecha devolución
    const updatePrestamo = `
      UPDATE prestamos SET fecha_devolucion = NOW()
      WHERE id_prestamo = ?
    `;

    db.query(updatePrestamo, [id], (err2) => {
      if (err2) return res.status(500).json(err2);

      // 3. Marcar libro como disponible
      const updateLibro = "UPDATE libros SET disponibilidad = true WHERE id_libro = ?";

      db.query(updateLibro, [id_libro], (err3) => {
        if (err3) return res.status(500).json(err3);

        res.json({ mensaje: "Libro devuelto" });
      });
    });
  });
});