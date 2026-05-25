const API_URL = "http://localhost:4000";

// ================= LIBROS =================
async function cargarLibros(){

  const res = await fetch(`${API_URL}/libros`);

  const data = await res.json();

  const lista = document.getElementById("listaLibros");

  lista.innerHTML = "";

  data.forEach(l => {

    const li = document.createElement("li");

    li.innerHTML = `
      <b>ID: ${l.id_libro} - ${l.titulo}</b>
      <br>
      Autor: ${l.autor}
      <br>
      Categoría: ${l.categoria}
      <br>
      Disponible: ${l.disponibilidad}
      <br><br>

      <button onclick="eliminarLibro(${l.id_libro})">
        Eliminar
      </button>
    `;

    lista.appendChild(li);

  });

}

async function agregarLibro(){

  const titulo =
    document.getElementById("titulo").value;

  const autor =
    document.getElementById("autor").value;

  const categoria =
    document.getElementById("categoria").value;

  await fetch(`${API_URL}/libros`, {

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      titulo,
      autor,
      categoria
    })

  });

  cargarLibros();

}

async function eliminarLibro(id){

  await fetch(`${API_URL}/libros/${id}`, {

    method:"DELETE"

  });

  cargarLibros();

}

// ================= USUARIOS =================
async function cargarUsuarios(){

  const res = await fetch(`${API_URL}/usuarios`);

  const data = await res.json();

  const lista = document.getElementById("listaUsuarios");

  lista.innerHTML = "";

  data.forEach(u => {

    const li = document.createElement("li");

    li.innerHTML = `
      <b>ID: ${u.id_usuario}</b>
      <br>
      Nombre: ${u.nombre}
      <br>
      Correo: ${u.correo}
    `;

    lista.appendChild(li);

  });

}

async function agregarUsuario(){

  const nombre =
    document.getElementById("nombreUsuario").value;

  const correo =
    document.getElementById("correoUsuario").value;

  await fetch(`${API_URL}/usuarios`, {

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      nombre,
      correo
    })

  });

  cargarUsuarios();

}

// ================= PRÉSTAMOS =================
async function cargarPrestamos(){

  const res = await fetch(`${API_URL}/prestamos`);

  const data = await res.json();

  const lista = document.getElementById("listaPrestamos");

  lista.innerHTML = "";

  data.forEach(p => {

    const li = document.createElement("li");

    li.innerHTML = `
      <b>ID Préstamo: ${p.id_prestamo}</b>
      <br>
      Usuario: ${p.usuario}
      <br>
      Libro: ${p.libro}
      <br>
      Fecha préstamo: ${p.fecha_prestamo}
      <br>
      Fecha devolución: ${p.fecha_devolucion || "No devuelto"}
      <br><br>

      <button onclick="devolverPrestamo(${p.id_prestamo})">
        Devolver
      </button>
    `;

    lista.appendChild(li);

  });

}

async function crearPrestamo(){

  const id_usuario =
    document.getElementById("idUsuarioPrestamo").value;

  const id_libro =
    document.getElementById("idLibroPrestamo").value;

  await fetch(`${API_URL}/prestamos`, {

    method:"POST",

    headers:{
      "Content-Type":"application/json"
    },

    body: JSON.stringify({
      id_usuario,
      id_libro
    })

  });

  cargarPrestamos();
  cargarLibros();

}

async function devolverPrestamo(id){

  await fetch(`${API_URL}/prestamos/devolver/${id}`, {

    method:"PUT"

  });

  cargarPrestamos();
  cargarLibros();

}

// ================= INIT =================
cargarLibros();
cargarUsuarios();
cargarPrestamos();