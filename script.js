const tablaBody = document.querySelector("#tablaCodigos tbody");

const codigosTotales = [
  { denominacion: "10 soles", codigo: "A1B2C3" },
  { denominacion: "10 soles", codigo: "X9Y8Z7" },
  { denominacion: "10 soles", codigo: "K3L2M1" },
  { denominacion: "10 soles", codigo: "J5H6G7" },
  { denominacion: "10 soles", codigo: "Q1W2E3" },
  { denominacion: "10 soles", codigo: "R4T5Y6" },
  { denominacion: "10 soles", codigo: "U7I8O9" },
  { denominacion: "10 soles", codigo: "P0A9S8" },
  { denominacion: "10 soles", codigo: "D3F4G5" },
  { denominacion: "10 soles", codigo: "H6J7K8" },

  { denominacion: "20 soles", codigo: "M1N2B3" },
  { denominacion: "20 soles", codigo: "V4C5X6" },
  { denominacion: "20 soles", codigo: "Z7L8K9" },
  { denominacion: "20 soles", codigo: "B0N9M8" },
  { denominacion: "20 soles", codigo: "A7S6D5" },

  { denominacion: "50 soles", codigo: "Q8W7E6" },
  { denominacion: "50 soles", codigo: "R5T4Y3" },

  { denominacion: "100 soles", codigo: "U2I3O4" },
  { denominacion: "100 soles", codigo: "P5A6S7" },

  { denominacion: "200 soles", codigo: "Z1X2C3" }
];

function obtenerUsados() {
  return JSON.parse(localStorage.getItem("codigosUsados")) || {};
}

function guardarUsados(usados) {
  localStorage.setItem("codigosUsados", JSON.stringify(usados));
}

function guardarReset(fecha, cantidad) {
  const resets = JSON.parse(localStorage.getItem("historialResets")) || [];
  resets.push({ fecha, cantidad });
  localStorage.setItem("historialResets", JSON.stringify(resets));
}

function cargarTabla() {
  tablaBody.innerHTML = "";
  const usados = obtenerUsados();

  codigosTotales.forEach((item, index) => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.denominacion}</td>
      <td>${item.codigo}</td>
      <td>${usados[item.codigo] ? "Usado" : "Disponible"}</td>
      <td>${usados[item.codigo] || "-"}</td>
      <td><button ${usados[item.codigo] ? "disabled" : ""}>Marcar como usado</button></td>
    `;

    if (usados[item.codigo]) {
      fila.classList.add("usado");
    }

    const boton = fila.querySelector("button");
    boton.addEventListener("click", () => {
      const fecha = new Date().toLocaleString();
      usados[item.codigo] = fecha;
      guardarUsados(usados);
      cargarTabla();
      cargarHistorialResets();
    });

    tablaBody.appendChild(fila);
  });
}

function cargarHistorialResets() {
  const resets = JSON.parse(localStorage.getItem("historialResets")) || [];
  const tbody = document.querySelector("#tablaResets tbody");
  tbody.innerHTML = "";

  resets.forEach((item, index) => {
    const fila = document.createElement("tr");
    fila.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.fecha}</td>
      <td>${item.cantidad}</td>
    `;
    tbody.appendChild(fila);
  });
}

function resetearEstados() {
  if (confirm("¿Estás seguro de que quieres resetear todos los estados?")) {
    const usados = obtenerUsados();
    const fechaReset = new Date().toLocaleString();
    guardarReset(fechaReset, Object.keys(usados).length);

    localStorage.removeItem("codigosUsados");
    cargarTabla();
    cargarHistorialResets();
    document.getElementById("inputEscaneo").focus();
  }
}

async function generarPDFTablaAuto() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("landscape");
  doc.setFontSize(16);
  doc.text("Registro de Código de Barras", 14, 15);

  const filas = [];
  document.querySelectorAll("#tablaCodigos tbody tr").forEach(tr => {
    const celdas = tr.querySelectorAll("td");
    const fila = [
      celdas[0].textContent, // #
      celdas[1].textContent, // Denominación
      celdas[2].textContent, // Código
      celdas[3].textContent, // Estado
      celdas[4].textContent  // Fecha
    ];
    filas.push(fila);
  });

  doc.autoTable({
    head: [["#", "Denominación", "Código", "Estado", "Fecha"]],
    body: filas,
    startY: 20,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 123, 255] }
  });

  doc.save("tabla-codigos.pdf");
}

document.getElementById("inputEscaneo").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    const codigoEscaneado = this.value.trim().toUpperCase();
    this.value = "";

    const usados = obtenerUsados();
    const encontrado = codigosTotales.find(item => item.codigo === codigoEscaneado);

    if (encontrado) {
      if (!usados[codigoEscaneado]) {
        usados[codigoEscaneado] = new Date().toLocaleString();
        guardarUsados(usados);
        cargarTabla();
        cargarHistorialResets();
        alert("✅ Código marcado como usado: " + codigoEscaneado);
      } else {
        alert("⚠️ Este código ya está marcado como usado.");
      }
    } else {
      alert("❌ Código no reconocido: " + codigoEscaneado);
    }
  }
});

cargarTabla();
cargarHistorialResets();
