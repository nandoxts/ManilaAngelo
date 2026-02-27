// Carrito persistente con localStorage
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let total = parseFloat(localStorage.getItem("carritoTotal")) || 0;

// Inicializar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  actualizarCarrito();
});

function guardarCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
  localStorage.setItem("carritoTotal", total.toFixed(2));
}

function agregarCarrito(nombre, precio) {
  const productoExistente = carrito.find((p) => p.nombre === nombre);
  if (productoExistente) {
    productoExistente.cantidad++;
  } else {
    carrito.push({ nombre, precio, cantidad: 1 });
  }
  total += precio;
  guardarCarrito();
  actualizarCarrito();
  mostrarNotificacion(`${nombre} agregado a tu bolsa`);
}

function actualizarCarrito() {
  const lista = document.getElementById("listaCarrito");
  const contador = document.getElementById("contador");
  const totalElemento = document.getElementById("total");
  const carritoVacio = document.getElementById("carritoVacio");

  lista.innerHTML = "";

  if (carrito.length === 0) {
    carritoVacio.style.display = "flex";
  } else {
    carritoVacio.style.display = "none";
    carrito.forEach((producto, index) => {
      const subtotal = producto.precio * producto.cantidad;
      const li = document.createElement("li");
      li.className = "carrito-item";
      li.innerHTML = `
                <div class="carrito-item-info">
                    <div class="carrito-item-nombre">${producto.nombre}</div>
                    <div class="carrito-item-cantidad">Cantidad: ${producto.cantidad}</div>
                </div>
                <div class="carrito-item-precio">S/ ${subtotal.toFixed(2)}</div>
                <button class="carrito-item-eliminar" onclick="eliminarDelCarrito(${index})" title="Eliminar"><i class="fas fa-times"></i></button>
            `;
      lista.appendChild(li);
    });
  }

  contador.textContent = carrito.reduce((sum, p) => sum + p.cantidad, 0);
  totalElemento.textContent = total.toFixed(2);
}

function eliminarDelCarrito(index) {
  const subtotal = carrito[index].precio * carrito[index].cantidad;
  total -= subtotal;
  if (total < 0) total = 0;
  carrito.splice(index, 1);
  guardarCarrito();
  actualizarCarrito();
  mostrarNotificacion("Producto eliminado");
}

function toggleCarrito() {
  const panel = document.getElementById("carritoPanel");
  const overlay = document.getElementById("overlay");
  panel.classList.toggle("active");
  overlay.classList.toggle("active");
}

function vaciarCarrito() {
  if (carrito.length === 0) {
    mostrarNotificacion("La bolsa ya está vacía");
    return;
  }
  if (confirm("¿Estás seguro de que deseas vaciar tu bolsa?")) {
    carrito = [];
    total = 0;
    guardarCarrito();
    actualizarCarrito();
    mostrarNotificacion("Bolsa vaciada");
  }
}

function abrirModalCompra() {
  if (carrito.length === 0) {
    mostrarNotificacion("Agrega productos a tu bolsa primero");
    return;
  }
  const modal = document.getElementById("modalCompra");
  const resumen = document.getElementById("resumenCompra");

  let resumenHTML = `
        <div class="modal-resumen-item">
            <strong>Productos:</strong>
            <span>${carrito.reduce((sum, p) => sum + p.cantidad, 0)}</span>
        </div>
    `;
  carrito.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;
    resumenHTML += `
            <div class="modal-resumen-item">
                <span>${producto.nombre} (x${producto.cantidad})</span>
                <span>S/ ${subtotal.toFixed(2)}</span>
            </div>
        `;
  });
  resumenHTML += `
        <div class="modal-resumen-item modal-resumen-total">
            <span>Total:</span>
            <span>S/ ${total.toFixed(2)}</span>
        </div>
    `;
  resumen.innerHTML = resumenHTML;
  modal.classList.add("active");
}

function cerrarModalCompra() {
  document.getElementById("modalCompra").classList.remove("active");
}

function procesarCompra(event) {
  event.preventDefault();
  const nombre = document.getElementById("nombre").value;
  const email = document.getElementById("email").value;
  const telefono = document.getElementById("telefono").value;
  const direccion = document.getElementById("direccion").value;
  const notas = document.getElementById("notas").value;

  let mensaje = `*NUEVA COMPRA*%0A%0A`;
  mensaje += `*Cliente:* ${nombre}%0A`;
  mensaje += `*Email:* ${email}%0A`;
  mensaje += `*Teléfono:* ${telefono}%0A`;
  mensaje += `*Dirección:* ${direccion}%0A%0A`;
  mensaje += `*PRODUCTOS:*%0A`;
  carrito.forEach((producto) => {
    const subtotal = producto.precio * producto.cantidad;
    mensaje += `- ${producto.nombre} (x${producto.cantidad}) - S/ ${subtotal.toFixed(2)}%0A`;
  });
  mensaje += `%0A*TOTAL: S/ ${total.toFixed(2)}*%0A%0A`;
  if (notas) mensaje += `*Notas:* ${notas}%0A`;

  window.open(`https://wa.me/51922277161?text=${mensaje}`, "_blank");

  cerrarModalCompra();
  document.getElementById("formCompra").reset();
  carrito = [];
  total = 0;
  guardarCarrito();
  actualizarCarrito();
  toggleCarrito();
  mostrarNotificacion("¡Compra enviada! Nos contactaremos pronto");
}

function mostrarNotificacion(mensaje) {
  const notif = document.createElement("div");
  notif.textContent = mensaje;
  notif.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 30px;
        background: #000;
        color: #fff;
        padding: 15px 25px;
        border-radius: 4px;
        font-size: 13px;
        z-index: 500;
        animation: slideIn 0.3s ease;
    `;
  document.body.appendChild(notif);
  setTimeout(() => {
    notif.style.animation = "slideOut 0.3s ease";
    setTimeout(() => notif.remove(), 300);
  }, 2000);
}

// Animaciones de notificación
(function () {
  const style = document.createElement("style");
  style.innerHTML = `
        @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to   { transform: translateX(0);     opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0);     opacity: 1; }
            to   { transform: translateX(400px); opacity: 0; }
        }
    `;
  document.head.appendChild(style);
})();

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
  const modal = document.getElementById("modalCompra");
  if (event.target === modal) cerrarModalCompra();
};
