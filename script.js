// script.js

// AÑADE TUS PRODUCTOS AQUÍ
// Copia y pega esta estructura para añadir más productos
const productos = [];

// Elementos del DOM
const searchInput = document.getElementById('searchInput');
const colorFilter = document.getElementById('colorFilter');
const maxPriceInput = document.getElementById('maxPrice');
const resultsList = document.getElementById('resultsList');

// Función para mostrar los productos en la lista
function mostrarProductos(listaProductos) {
    // Limpiamos los resultados anteriores
    resultsList.innerHTML = '';

    // Si no hay resultados en la búsqueda
    if (listaProductos.length === 0) {
        resultsList.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
        return;
    }

    // Recorremos la lista de productos y creamos el HTML para cada uno
    listaProductos.forEach(producto => {
        // Creamos un contenedor (carta) para cada producto
        const productCard = document.createElement('div');
        productCard.classList.add('product-card');

        // Generar HTML de las fotos (carrusel estilo Instagram)
        let fotosHTML = '';
        if (producto.fotos && producto.fotos.length > 0) {
            // Generar las etiquetas <img> para cada foto
            const imagenes = producto.fotos.map(foto => {
                // Opciones de estilo para fotos que no encajan perfectamente
                let estiloEspecial = '';

                // Mostrar la imagen entera sin recorte ninguno (con fondo blanco para rellenar)
                if (foto.includes('planta.PNG') ||
                    foto.includes('zapatillas_nyc2/suela.PNG') ||
                    foto.includes('zapatillas_nyc2/plantilla.PNG') ||
                    foto.includes('zapatillas_vans/plantilla.PNG')) {
                    estiloEspecial = 'style="object-fit: contain; background-color: #fff;"';
                }
                // Hacer un ajuste de posición para compensar recortes por arriba/abajo
                else if (foto.includes('zapatillas_Adidas_campus/plantilla.PNG') ||
                    foto.includes('deportivas_mustang/plantilla.PNG') ||
                    foto.includes('botas_quechua/suela.PNG') ||
                    foto.includes('zapatillas_nyc1/suela.PNG')) {
                    estiloEspecial = 'style="object-position: center 25%;"';
                }

                return `<img src="${foto}" alt="Foto" class="carousel-img" ${estiloEspecial}>`;
            }).join('');

            // Sólo mostramos los botones de < y > si hay más de 1 foto
            const btnPrev = producto.fotos.length > 1 ? `<button class="carousel-btn prev" aria-label="Foto anterior">&lt;</button>` : '';
            const btnNext = producto.fotos.length > 1 ? `<button class="carousel-btn next" aria-label="Foto siguiente">&gt;</button>` : '';

            fotosHTML = `
                <div class="carousel">
                    ${btnPrev}
                    <div class="carousel-track">
                        ${imagenes}
                    </div>
                    ${btnNext}
                </div>
            `;
        }

        // Obtenemos el precio si existe
        const precioHTML = producto.precio ? `<span class="product-price">${producto.precio}</span>` : '';

        // Obtenemos la marca si existe
        const marcaHTML = producto.marca ? `<span class="product-brand">${producto.marca}</span>` : '';

        // Obtenemos la talla si existe
        const tallaHTML = producto.talla ? `<span class="product-size">Talla ${producto.talla}</span>` : '';

        // Obtenemos los colores si existen (en formato de etiquetas pequeñas)
        let coloresHTML = '';
        if (producto.colores && producto.colores.length > 0) {
            const colorsList = producto.colores.map(color => `<span class="color-tag">${color}</span>`).join('');
            coloresHTML = `<div class="product-colors">${colorsList}</div>`;
        }

        // Hacemos que la descripción y advertencia sólo se muestren si están definidas para ese producto particular
        const descHTML = producto.descripcion ? `<p class="product-desc">${producto.descripcion}</p>` : '';
        const advHTML = producto.advertencia ? `<div class="product-warning">⚠️ ${producto.advertencia}</div>` : '';

        // Añadimos el HTML agrupado de la información del perfil
        productCard.innerHTML = `
            ${fotosHTML}
            <div class="product-info">
                <div class="product-header">
                    <div class="product-tags">
                        ${producto.categoria ? `<span class="product-category">${producto.categoria}</span>` : ''}
                        ${marcaHTML}
                        ${tallaHTML}
                    </div>
                    ${precioHTML}
                </div>
                <h3 class="product-name">${producto.nombre}</h3>
                ${coloresHTML}
                ${descHTML}
                ${advHTML}
            </div>
        `;

        // Lo añadimos al contenedor principal de resultados
        resultsList.appendChild(productCard);
    });
}

// Lógica de los botones del carrusel (delegación de eventos en el contenedor general)
resultsList.addEventListener('click', function (e) {
    if (e.target.classList.contains('prev')) {
        const track = e.target.nextElementSibling;
        track.scrollBy({ left: -track.offsetWidth, behavior: 'smooth' });
    } else if (e.target.classList.contains('next')) {
        const track = e.target.previousElementSibling;
        track.scrollBy({ left: track.offsetWidth, behavior: 'smooth' });
    }
});

// Al cargar la página, mostramos todos los productos por defecto
mostrarProductos(productos);

// Función para aplicar todos los filtros de búsqueda y de precio
function aplicarFiltros() {
    const textoBusqueda = searchInput.value.toLowerCase().trim();
    const colorSeleccionado = colorFilter.value.toLowerCase();
    const maxP = parseFloat(maxPriceInput.value);

    // Filtramos los productos
    const productosFiltrados = productos.filter(producto => {
        // --- 1. Filtro de Texto ---
        const nombreMatch = producto.nombre && producto.nombre.toLowerCase().includes(textoBusqueda);
        const descripcionMatch = producto.descripcion && producto.descripcion.toLowerCase().includes(textoBusqueda);
        const categoriaMatch = producto.categoria && producto.categoria.toLowerCase().includes(textoBusqueda);
        const marcaMatch = producto.marca && producto.marca.toLowerCase().includes(textoBusqueda);
        const tallaMatch = producto.talla && producto.talla.toLowerCase().includes(textoBusqueda);

        // Pasa el filtro de texto si el input está vacío o coincide con alguna propiedad
        const textoPasa = textoBusqueda === "" || nombreMatch || descripcionMatch || categoriaMatch || marcaMatch || tallaMatch;

        // --- 2. Filtro de Color ---
        let colorPasa = true;
        if (colorSeleccionado !== "") {
            colorPasa = producto.colores && producto.colores.some(color => color.toLowerCase() === colorSeleccionado);
        }

        // --- 3. Filtro de Precio ---
        let precioPasa = true; // Por defecto pasa

        if (producto.precio) {
            // Limpia el precio: quita "€", cambia la coma "," por "." y lo convierte a número flotante
            const precioLimpio = producto.precio.replace('€', '').replace(',', '.').trim();
            const precioNum = parseFloat(precioLimpio);

            if (!isNaN(precioNum)) {
                // Comprueba si rompe el límite máximo
                if (!isNaN(maxP) && precioNum > maxP) {
                    precioPasa = false;
                }
            }
        }

        // El producto se muestra solo si pasa correctamente TODOS los filtros
        return textoPasa && colorPasa && precioPasa;
    });

    // Actualizamos la vista con los resultados filtrados
    mostrarProductos(productosFiltrados);
}

// Event listeners para ejecutar la función cada vez que se modifiquen los controles
searchInput.addEventListener('input', aplicarFiltros);
colorFilter.addEventListener('change', aplicarFiltros);
maxPriceInput.addEventListener('input', aplicarFiltros);
