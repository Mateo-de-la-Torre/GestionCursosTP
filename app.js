// Clase Estudiante
class Estudiante {
  constructor(nombre, edad, nota) {
    this.nombre = nombre;
    this.edad = edad;
    this.nota = nota;
  }

  presentarse() {
    return `${this.nombre} (${this.edad} años) - Nota: ${this.nota}`;
  }
}

// Clase Curso
class Curso {
  constructor(nombre, profesor) {
    this.nombre = nombre;
    this.profesor = profesor;
    this.estudiantes = [];
  }

  agregarEstudiante(estudiante) {
    this.estudiantes.push(estudiante);
  }

  listarEstudiantes(estudiantesAmostrar = this.estudiantes) {
    return estudiantesAmostrar.map((est, estudianteIndex) => `
        <div class="estudiante">
          ${est.presentarse()}
          <span class="botones-estudiante">
            <button class="btn-editar" onclick="editarEstudiante(${cursos.indexOf(this)}, ${estudianteIndex})">Editar</button>
            <button class="btn-eliminar" onclick="eliminarEstudiante(${estudianteIndex})">Eliminar</button>
          </span>
        </div>
      `).join('<br>');
  }

  obtenerPromedio() {
    let totalNotas = this.estudiantes.reduce((total, est) => total + est.nota, 0);
    return (this.estudiantes.length > 0) ? (totalNotas / this.estudiantes.length).toFixed(2) : 'N/A';
  }
}

// Arreglo para almacenar los cursos
let cursos = [];

// DOM elements
const formCurso = document.getElementById('form-curso');
const formEstudiante = document.getElementById('form-estudiante');
const cursoEstudianteSelect = document.getElementById('curso-estudiante');
const listaCursos = document.getElementById('lista-cursos');


// Función para guardar los cursos en LocalStorage
function guardarLocalStorage() {
  localStorage.setItem('cursos', JSON.stringify(cursos));
}

function cargarCursosDesdeLocalStorage() {
  const cursosGuardados = localStorage.getItem('cursos');
  if (cursosGuardados) {
    const cursosData = JSON.parse(cursosGuardados);

    // Crear nuevas instancias de Curso y Estudiante
    cursos = cursosData.map(cursoData => {
      const curso = new Curso(cursoData.nombre, cursoData.profesor);
      curso.estudiantes = cursoData.estudiantes.map(estData =>
        new Estudiante(estData.nombre, estData.edad, estData.nota)
      );
      return curso;
    });

    mostrarCursos();
  }
}


// Llama a esta función cuando la página se carga
window.addEventListener('load', () => {
  cargarCursosDesdeLocalStorage(),
    actualizarEstadisticas();
});

// Evento para agregar un curso
formCurso.addEventListener('submit', (e) => {
  e.preventDefault();

  // Capturar datos del formulario
  const nombreCurso = document.getElementById('nombre-curso').value;
  const profesorCurso = document.getElementById('profesor-curso').value;

  if (!nombreCurso || !profesorCurso) {
    mostrarError(formCurso, 'Todos los campos son obligatorios');
    return;
  }

  // Crear un nuevo curso
  const nuevoCurso = new Curso(nombreCurso, profesorCurso);
  cursos.push(nuevoCurso);

  // Limpiar formulario
  formCurso.reset();
  limpiarErrores(formCurso);

  // Actualizar la lista de cursos en el select
  actualizarCursosSelect();

  // Mostrar los cursos
  mostrarCursos();

  guardarLocalStorage();

  actualizarEstadisticas();
});

// Evento para agregar un estudiante
formEstudiante.addEventListener('submit', (e) => {
  e.preventDefault();

  // Capturar datos del formulario
  const nombreEstudiante = document.getElementById('nombre-estudiante').value;
  const edadEstudiante = parseInt(document.getElementById('edad-estudiante').value);
  const notaEstudiante = parseFloat(document.getElementById('nota-estudiante').value);
  const cursoIndex = cursoEstudianteSelect.value;

  // Validar dats
  if (!nombreEstudiante || isNaN(edadEstudiante) || isNaN(notaEstudiante)) {
    mostrarError(formEstudiante, 'Todos los campos son obligatorios y deben ser válidos');
    return;
  }
  if (edadEstudiante <= 0) {
    mostrarError(formEstudiante, 'La edad debe ser un número positivo');
    return;
  }
  if (notaEstudiante < 0 || notaEstudiante > 10) {
    mostrarError(formEstudiante, 'La nota debe estar entre 0 y 10');
    return;
  }

  // Crear un nuevo estudiante
  const nuevoEstudiante = new Estudiante(nombreEstudiante, edadEstudiante, notaEstudiante);

  // Agregar estudiante al curso seleccionado
  cursos[cursoIndex].agregarEstudiante(nuevoEstudiante);

  // Limpiar formulario
  formEstudiante.reset();
  limpiarErrores(formEstudiante);

  // Mostrar los cursos actualizados
  mostrarCursos();

  guardarLocalStorage();

  actualizarEstadisticas();
});

// Función para actualizar el select de cursos
function actualizarCursosSelect() {
  cursoEstudianteSelect.innerHTML = '';
  cursos.forEach((curso, index) => {
    let option = document.createElement('option');
    option.value = index;
    option.textContent = curso.nombre;
    cursoEstudianteSelect.appendChild(option);
  });
}


// Función para mostrar los cursos y estudiantes
function mostrarCursos(cursosAmostrar = cursos) {
  listaCursos.innerHTML = '';
  cursosAmostrar.forEach((curso, cursoIndex) => {
    let cursoDiv = document.createElement('div');
    cursoDiv.classList.add('curso');

    cursoDiv.innerHTML = `
        <h3>Curso: ${curso.nombre} (Profesor: ${curso.profesor})</h3>
        <p><strong>Promedio:</strong> ${curso.obtenerPromedio()}</p>
        <button class="btn-editar" onclick="editarCurso(${cursoIndex})">Editar Curso</button>
        <button class="btn-eliminar" onclick="eliminarCurso(${cursoIndex})">Eliminar Curso</button>

        <div class="estudiantes">
          <strong>Estudiantes:</strong><br>
          ${curso.listarEstudiantes() || 'No hay estudiantes en este curso.'}
        </div>
      `;

    listaCursos.appendChild(cursoDiv);
  });


}

function editarCurso(index) {
  const curso = cursos[index];
  const nuevoNombre = prompt('Nuevo nombre del curso:', curso.nombre);
  const nuevoProfesor = prompt('Nuevo nombre del profesor:', curso.profesor);

  if (nuevoNombre && nuevoProfesor) {
    curso.nombre = nuevoNombre;
    curso.profesor = nuevoProfesor;
    mostrarCursos();
    actualizarCursosSelect();
    guardarLocalStorage();
    actualizarEstadisticas();
  }
}

function editarEstudiante(cursoIndex, estIndex) {
  const estudiante = cursos[cursoIndex].estudiantes[estIndex];
  const nuevoNombre = prompt('Nuevo nombre del estudiante:', estudiante.nombre);
  const nuevaEdad = parseInt(prompt('Nueva edad del estudiante:', estudiante.edad));
  const nuevaNota = parseFloat(prompt('Nueva nota del estudiante:', estudiante.nota));

  if (nuevoNombre && nuevaEdad && nuevaNota) {
    estudiante.nombre = nuevoNombre;
    estudiante.edad = nuevaEdad;
    estudiante.nota = nuevaNota;
    mostrarCursos();
    guardarLocalStorage();
    actualizarEstadisticas();
  }
}

function eliminarEstudiante(cursoIndex, estIndex) {
  cursos[cursoIndex].estudiantes.splice(estIndex, 1);
  mostrarCursos();
  guardarLocalStorage();
}

function eliminarCurso(index) {
  cursos.splice(index, 1);
  mostrarCursos();
  actualizarCursosSelect();
  guardarLocalStorage();
  actualizarEstadisticas();
}


function mostrarError(form, mensaje) {
  let errorDiv = form.querySelector('.error');
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    form.appendChild(errorDiv);
  }
  errorDiv.textContent = mensaje;
}

function limpiarErrores(form) {
  const errorDiv = form.querySelector('.error');
  if (errorDiv) {
    form.removeChild(errorDiv);
  }
}


// Filtrar estudiantes y cursos
function filtrarCursosYEstudiantes() {
  const buscarInput = document.getElementById('buscar-general').value.toLowerCase(); // Cambiado: un solo input

  cursos.forEach(curso => {
    curso.estudiantesFiltrados = curso.estudiantes.filter(est => est.nombre.toLowerCase().includes(buscarInput));
  });

  const cursosFiltrados = cursos.filter(curso => curso.profesor.toLowerCase().includes(buscarInput));

  mostrarCursos(cursosFiltrados);
}

document.getElementById('buscar-general').addEventListener('input', filtrarCursosYEstudiantes);


function actualizarEstadisticas() {
  const totalCursos = cursos.length;
  let totalEstudiantes = 0;
  let sumaTotalNotas = 0;
  let mejorCurso = null;
  let mejorPromedio = -1;

  cursos.forEach(curso => {
    totalEstudiantes += curso.estudiantes.length;

    const promedioCurso = curso.obtenerPromedio();
    if (promedioCurso !== 'N/A') {
      sumaTotalNotas += curso.estudiantes.reduce((total, est) => total + est.nota, 0);

      if (promedioCurso > mejorPromedio) {
        mejorPromedio = promedioCurso;
        mejorCurso = curso.nombre;
      }
    }
  });

  // Calcular el promedio general de todos los estudiantes
  const promedioGeneral = totalEstudiantes > 0 ? (sumaTotalNotas / totalEstudiantes).toFixed(2) : 'N/A';

  // Actualizar DOM
  document.getElementById('total-cursos').textContent = `Total de cursos: ${totalCursos}`;
  document.getElementById('total-estudiantes').textContent = `Total de estudiantes: ${totalEstudiantes}`;
  document.getElementById('promedio-general').textContent = `Promedio general de todos los estudiantes: ${promedioGeneral}`;
  document.getElementById('mejor-curso').textContent = `Curso con mejor promedio: ${mejorCurso || 'N/A'}`;
}









