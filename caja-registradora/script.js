// Billetes y monedas disponibles en la caja
const caja = {
    500: 0,
    200: 0,
    100: 0,
    50: 1,
    20: 4,
    10: 8,
    5: 2,
    2: 5,
    1: 4,
    0.5: 0,
    0.2: 0,
    0.1: 1,
    0.05: 2,
    0.02: 3,
    0.01: 1
};

// Inicializar la página
document.addEventListener('DOMContentLoaded', function () {
    // Generar inputs para cada denominación
    const container = document.getElementById('entregado-container');
    const denominaciones = Object.keys(caja).map(Number).sort((a, b) => b - a);

    denominaciones.forEach(valor => {
        const div = document.createElement('div');
        div.innerHTML = `
            <label>${valor}€:</label>
            <input type="number" id="entregado-${valor}" min="0" value="0">
        `;
        container.appendChild(div);
    });

    // Configurar evento del botón
    document.getElementById('calcular-btn').addEventListener('click', procesarPago);

    actualizarEstadoCaja();
});

// Función para mostrar el estado de la caja
function actualizarEstadoCaja() {
    const div = document.getElementById('estado-caja');
    div.innerHTML = '';

    const denominaciones = Object.keys(caja).map(Number).sort((a, b) => b - a);

    denominaciones.forEach(valor => {
        if (caja[valor] > 0) {
            div.innerHTML += `<p>${valor}€: ${caja[valor]}</p>`;
        }
    });

    // Calcular total
    let total = 0;
    for (const [valor, cantidad] of Object.entries(caja)) {
        total += valor * cantidad;
    }
    div.innerHTML += `<p><strong>Total: ${total.toFixed(2)}€</strong></p>`;
}

// Función principal para procesar el pago
function procesarPago() {
    const precio = parseFloat(document.getElementById('precio').value);


    // Obtener el pago ingresado
    const pago = {};
    const denominaciones = Object.keys(caja).map(Number).sort((a, b) => b - a);

    denominaciones.forEach(valor => {
        const cantidad = parseInt(document.getElementById(`entregado-${valor}`).value) || 0;
        if (cantidad > 0) {
            pago[valor] = cantidad;
        }
    });

    // Calcular total pagado
    let totalPagado = 0;
    for (const [valor, cantidad] of Object.entries(pago)) {
        totalPagado += valor * cantidad;
    }

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.innerHTML = '';

    // Verificar si el pago es suficiente
    if (totalPagado < precio) {
        resultadoDiv.innerHTML = `<p>Pago insuficiente. Faltan ${(precio - totalPagado).toFixed(2)}€</p>`;
        return;
    }

    const cambioTotal = totalPagado - precio;

    if (cambioTotal === 0) {
        resultadoDiv.innerHTML = `<p>Pago exacto. No se necesita cambio.</p>`;
        // Actualizar caja con el pago recibido
        for (const [valor, cantidad] of Object.entries(pago)) {
            caja[valor] += cantidad;
        }
        actualizarEstadoCaja();
        return;
    }

    // Calcular cambio
    let cambioRestante = cambioTotal;
    const cambio = {};

    for (const valor of denominaciones) {
        if (cambioRestante <= 0) break;
        if (caja[valor] > 0 && valor <= cambioRestante) {
            const maxNecesario = Math.floor(cambioRestante / valor);
            const dar = Math.min(maxNecesario, caja[valor]);

            if (dar > 0) {
                cambio[valor] = dar;
                cambioRestante -= valor * dar;
                cambioRestante = parseFloat(cambioRestante.toFixed(2));
            }
        }
    }

    // Verificar si se pudo dar todo el cambio
    if (cambioRestante > 0.01) {
        resultadoDiv.innerHTML = `<p>No hay suficiente cambio en la caja para devolver ${cambioTotal.toFixed(2)}€</p>`;
        return;
    }

    // Mostrar resultado
    resultadoDiv.innerHTML = `<p>Cambio a devolver: ${cambioTotal.toFixed(2)}€</p>`;
    resultadoDiv.innerHTML += `<p>Desglose del cambio:</p>`;

    for (const [valor, cantidad] of Object.entries(cambio)) {
        resultadoDiv.innerHTML += `<p>${valor}€: ${cantidad}</p>`;
    }

    // Actualizar la caja
    for (const [valor, cantidad] of Object.entries(pago)) {
        caja[valor] += cantidad;
    }
    for (const [valor, cantidad] of Object.entries(cambio)) {
        caja[valor] -= cantidad;
    }

    actualizarEstadoCaja();
}