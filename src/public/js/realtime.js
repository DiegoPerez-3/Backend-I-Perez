// Inicializamos la conexión del lado del cliente con Socket.io
const socket = io();

// Referencias a los elementos del DOM
const productForm = document.getElementById("product-form");
const productsContainer = document.getElementById("realtime-products-container");

// Función para renderizar los productos de forma dinámica cuando hay cambios
function renderProducts(products) {
    productsContainer.innerHTML = ""; // Limpiamos el contenedor

    if (products.length === 0) {
        productsContainer.innerHTML = `
            <div class="empty-state">
                <p>No hay productos registrados en el catálogo actualmente.</p>
            </div>
        `;
        return;
    }

    products.forEach((product) => {
        const productCard = document.createElement("div");
        productCard.classList.add("product-card");

        productCard.innerHTML = `
            <div class="product-badge">${product.category}</div>
            <div class="product-content">
                <h3 class="product-title">${product.title}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-meta">
                    <span class="product-code">Código: <strong>${product.code}</strong></span>
                    <span class="product-stock ${product.stock > 0 ? "in-stock" : "no-stock"}">
                        Stock: ${product.stock}
                    </span>
                </div>
            </div>
            <div class="product-footer">
                <span class="product-price">$${product.price}</span>
                <span class="product-id">ID: ${product.id}</span>
            </div>
            <div class="product-actions-bar">
                <button class="btn btn-delete" data-id="${product.id}">🗑️ Eliminar</button>
            </div>
        `;

        productsContainer.appendChild(productCard);
    });
}

// Delegación de eventos para el botón de eliminar
// Esto permite escuchar clics tanto en los elementos renderizados inicialmente por SSR como en los cargados por Sockets
productsContainer.addEventListener("click", (e) => {
    // Si el elemento clickeado es el botón de eliminar o está dentro de él
    const deleteButton = e.target.closest(".btn-delete");
    if (deleteButton) {
        const productId = deleteButton.getAttribute("data-id");
        console.log("Emitiendo eliminación de producto con ID:", productId);
        socket.emit("delete_product", productId);
    }
});

// Escuchamos la lista inicial de productos al conectarse para sincronizar cualquier cambio
socket.on("products_initial", (products) => {
    console.log("Lista inicial sincronizada por socket:", products);
    renderProducts(products);
});

// Escuchamos actualizaciones en tiempo real de la lista de productos
socket.on("products_updated", (products) => {
    console.log("Catálogo actualizado en tiempo real:", products);
    renderProducts(products);
});

// Escuchamos errores ocurridos en el servidor
socket.on("error_message", (message) => {
    alert(`Error: ${message}`);
});

// Manejamos el envío del formulario de creación
if (productForm) {
    productForm.addEventListener("submit", (e) => {
        e.preventDefault(); // Evitamos la recarga de página convencional de HTTP

        // Obtenemos los valores de los campos
        const title = document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const code = document.getElementById("code").value.trim();
        const price = parseFloat(document.getElementById("price").value);
        const stock = parseInt(document.getElementById("stock").value, 10);
        const category = document.getElementById("category").value.trim();

        // Validamos que los datos básicos estén presentes
        if (title && description && code && !isNaN(price) && !isNaN(stock) && category) {
            const newProduct = {
                title,
                description,
                code,
                price,
                stock,
                category,
                status: true // valor por defecto
            };

            // Emitimos el producto por websocket al servidor
            socket.emit("add_product", newProduct);
            
            // Reseteamos el formulario
            productForm.reset();
        } else {
            alert("Por favor, completa todos los campos del formulario.");
        }
    });
}
