// Cliente JavaScript para gestión interactiva del carrito de compras y localStorage
document.addEventListener("DOMContentLoaded", async () => {
    // Función para obtener o crear el ID del carrito en localStorage
    async function getOrCreateCartId() {
        let cartId = localStorage.getItem("cartId");

        if (!cartId || cartId === "null" || cartId === "undefined") {
            try {
                const response = await fetch("/api/carts", { method: "POST" });
                const data = await response.json();
                if (data.status === "success" && data.data && data.data._id) {
                    cartId = data.data._id;
                    localStorage.setItem("cartId", cartId);
                }
            } catch (error) {
                console.error("Error al autogenerar el carrito:", error);
            }
        }
        return cartId;
    }

    const currentCartId = await getOrCreateCartId();

    // Actualizamos el href del botón "Mi Carrito 🛒" en la barra de navegación
    const navCartBtn = document.getElementById("nav-cart-btn");
    if (navCartBtn) {
        if (currentCartId) {
            navCartBtn.href = `/carts/${currentCartId}`;
        } else {
            navCartBtn.addEventListener("click", async (e) => {
                e.preventDefault();
                const newId = await getOrCreateCartId();
                if (newId) window.location.href = `/carts/${newId}`;
            });
        }
    }

    // Evento para botones "Agregar al Carrito" en tarjetas del catálogo
    document.addEventListener("click", async (e) => {
        const addCartBtn = e.target.closest(".btn-add-cart");
        if (addCartBtn) {
            const productId = addCartBtn.getAttribute("data-id");
            const cartId = await getOrCreateCartId();

            if (!cartId) {
                alert("Error al obtener el carrito de compras.");
                return;
            }

            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" }
                });
                const result = await response.json();

                if (result.status === "success") {
                    alert("🛒 ¡Producto agregado al carrito con éxito!");
                } else {
                    alert(`Error: ${result.message || "No se pudo agregar el producto"}`);
                }
            } catch (err) {
                alert("Error de conexión al agregar el producto al carrito.");
            }
        }
    });

    // Evento para botón "Agregar al Carrito" en la vista de detalle (/products/:pid)
    const detailAddBtn = document.querySelector(".btn-add-cart-detail");
    if (detailAddBtn) {
        detailAddBtn.addEventListener("click", async () => {
            const productId = detailAddBtn.getAttribute("data-id");
            const qtyInput = document.getElementById("detail-quantity");
            const quantity = qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;

            const cartId = await getOrCreateCartId();
            if (!cartId) {
                alert("Error al identificar el carrito.");
                return;
            }

            try {
                const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity })
                });
                const result = await response.json();

                if (result.status === "success") {
                    alert(`🛒 ¡Se agregaron ${quantity} unidad(es) al carrito!`);
                } else {
                    alert(`Error: ${result.message || "No se pudo agregar al carrito"}`);
                }
            } catch (err) {
                alert("Error de conexión al procesar la solicitud.");
            }
        });
    }

    // Eventos para eliminar ítems del carrito en la vista /carts/:cid
    document.addEventListener("click", async (e) => {
        const deleteItemBtn = e.target.closest(".btn-delete-cart-item");
        if (deleteItemBtn) {
            const cartId = deleteItemBtn.getAttribute("data-cid");
            const productId = deleteItemBtn.getAttribute("data-pid");

            if (confirm("¿Estás seguro de que deseas eliminar este producto del carrito?")) {
                try {
                    const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                        method: "DELETE"
                    });
                    const result = await response.json();

                    if (result.status === "success") {
                        window.location.reload();
                    } else {
                        alert(`Error: ${result.message}`);
                    }
                } catch (err) {
                    alert("Error al eliminar el producto.");
                }
            }
        }
    });

    // Eventos para modificar cantidad (+ / -) en la vista /carts/:cid
    document.addEventListener("click", async (e) => {
        const qtyBtn = e.target.closest(".btn-qty");
        if (qtyBtn) {
            const cartId = qtyBtn.getAttribute("data-cid");
            const productId = qtyBtn.getAttribute("data-pid");
            const currentQty = parseInt(qtyBtn.getAttribute("data-qty"), 10);
            const isPlus = qtyBtn.classList.contains("btn-plus");

            const newQty = isPlus ? currentQty + 1 : currentQty - 1;

            if (newQty < 1) {
                alert("La cantidad mínima es 1. Utiliza el botón eliminar si deseas quitar el producto.");
                return;
            }

            try {
                const response = await fetch(`/api/carts/${cartId}/products/${productId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quantity: newQty })
                });
                const result = await response.json();

                if (result.status === "success") {
                    window.location.reload();
                } else {
                    alert(`Error: ${result.message}`);
                }
            } catch (err) {
                alert("Error al actualizar la cantidad.");
            }
        }
    });

    // Evento para vaciar el carrito completo
    const clearCartBtn = document.querySelector(".btn-clear-cart");
    if (clearCartBtn) {
        clearCartBtn.addEventListener("click", async () => {
            const cartId = clearCartBtn.getAttribute("data-cid");
            if (confirm("¿Estás seguro de que deseas vaciar completamente tu carrito?")) {
                try {
                    const response = await fetch(`/api/carts/${cartId}`, {
                        method: "DELETE"
                    });
                    const result = await response.json();

                    if (result.status === "success") {
                        window.location.reload();
                    } else {
                        alert(`Error: ${result.message}`);
                    }
                } catch (err) {
                    alert("Error al vaciar el carrito.");
                }
            }
        });
    }
});
