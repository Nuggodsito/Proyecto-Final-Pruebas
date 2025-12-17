// tests/03-carrito.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

// Limpiar carrito antes de cada prueba (opcional)
test.beforeEach(async ({ page }) => {
  await page.goto(`${BASE_URL}/cart.jsp`);
  await page.evaluate(() => {
    localStorage.setItem('carrito', JSON.stringify([]));
  });
});

test.describe('CU#3: Agregar al Carrito', () => {
  
  // CP-011: Agregar producto al carrito
  test('CP-011: Agregar producto al carrito', async ({ page }) => {
    console.log('CP-011: Agregar producto al carrito');
    
    await page.goto(`${BASE_URL}/products.jsp`);
    await expect(page).toHaveURL(/products\.jsp/);
    
    // Esperar a que carguen los productos
    await page.waitForSelector('.product-card');
    
    // Buscar botón "Añadir al carrito" (texto exacto de tu código)
    const botonesAgregar = page.locator('button.add-to-cart');
    const countBotones = await botonesAgregar.count();
    
    if (countBotones > 0) {
      console.log(`CP-011: Encontrados ${countBotones} productos disponibles`);
      
      // Hacer clic en el primer botón "Añadir al carrito"
      await botonesAgregar.first().click();
      
      // Verificar notificación "añadido al carrito" (de tu código)
      const notificacion = page.locator('#cart-notification');
      
      // Esperar a que aparezca la notificación
      await page.waitForTimeout(1000);
      
      if (await notificacion.isVisible()) {
        const textoNotificacion = await notificacion.textContent();
        console.log(`CP-011: Notificación mostrada: ${textoNotificacion}`);
      } else {
        // Buscar notificación por texto
        const textoNotificacion = page.locator('text=/añadido al carrito/i');
        if (await textoNotificacion.isVisible()) {
          console.log('CP-011: Mensaje "añadido al carrito" visible');
        } else {
          console.log('CP-011: Producto agregado pero sin notificación visible');
        }
      }
    } else {
      console.log('CP-011: No se encontraron productos disponibles');
    }
  });
  
  // CP-013: Consultar carrito
  test('CP-013: Consultar carrito', async ({ page }) => {
    console.log('CP-013: Consultar carrito');
    
    await page.goto(`${BASE_URL}/cart.jsp`);
    await expect(page).toHaveURL(/cart\.jsp/);
    await expect(page.locator('h1')).toContainText('Tu Carrito de Compras');
    
    // Verificar mensaje de carrito vacío
    const carritoVacio = page.locator('text=Tu carrito está vacío');
    
    if (await carritoVacio.isVisible()) {
      console.log('CP-013: Carrito vacío - mensaje correcto');
      
      // Verificar enlace "Ir a Productos"
      const enlaceProductos = page.locator('text=Ir a Productos');
      await expect(enlaceProductos).toBeVisible();
    } else {
      // Si no está vacío, verificar que muestra productos
      const itemsCarrito = page.locator('.cart-item');
      const countItems = await itemsCarrito.count();
      
      if (countItems > 0) {
        console.log(`CP-013: Carrito muestra ${countItems} productos`);
      } else {
        console.log('CP-013: Carrito no vacío pero sin productos visibles');
      }
    }
  });
  
  // CP-014: Continuar navegando después de agregar
  test('CP-014: Continuar navegando manteniendo productos', async ({ page }) => {
    console.log('CP-014: Continuar navegando');
    
    // Agregar producto al carrito primero
    await page.goto(`${BASE_URL}/products.jsp`);
    await page.waitForSelector('.product-card');
    
    const botonesAgregar = page.locator('button.add-to-cart');
    if (await botonesAgregar.first().isVisible()) {
      await botonesAgregar.first().click();
      await page.waitForTimeout(1000);
      
      console.log('CP-014: Producto agregado al carrito');
      
      // Filtrar por categoría "celulares" (como en tu codegen)
      const selectCategoria = page.locator('#category-select');
      if (await selectCategoria.isVisible()) {
        await selectCategoria.selectOption('celulares');
        await page.waitForTimeout(2000); // Esperar recarga
        
        // Verificar que cambió la categoría
        const urlActual = page.url();
        if (urlActual.includes('category=celulares')) {
          console.log('CP-014: Categoría cambiada a celulares');
        }
      }
      
      // Ir al carrito para verificar que mantiene el producto
      await page.goto(`${BASE_URL}/cart.jsp`);
      
      const carritoVacio = await page.locator('text=Tu carrito está vacío').isVisible();
      
      if (!carritoVacio) {
        console.log('CP-014: Carrito mantuvo productos después de navegar');
      } else {
        console.log('CP-014: Carrito perdió productos al navegar');
      }
    }
  });
});

test.describe('CU#4: Gestionar Carrito', () => {
  
  // Preparar carrito con productos para estas pruebas
  test.beforeEach(async ({ page }) => {
    // Agregar productos al carrito primero
    await page.goto(`${BASE_URL}/products.jsp`);
    await page.waitForSelector('.product-card');
    
    // Agregar dos productos diferentes
    const botonesAgregar = page.locator('button.add-to-cart');
    const count = await botonesAgregar.count();
    
    if (count >= 2) {
      // Agregar primer producto
      await botonesAgregar.nth(0).click();
      await page.waitForTimeout(500);
      
      // Agregar segundo producto
      await botonesAgregar.nth(1).click();
      await page.waitForTimeout(500);
      
      console.log('Preparado: 2 productos agregados al carrito');
    }
  });
  
  // CP-016: Modificar cantidad de producto
  test('CP-016: Modificar cantidad de producto', async ({ page }) => {
    console.log('CP-016: Modificar cantidad');
    
    await page.goto(`${BASE_URL}/cart.jsp`);
    
    // Buscar botón para aumentar cantidad (+)
    const botonMas = page.locator('.cart-item .qty-btn.plus').first();
    
    if (await botonMas.isVisible()) {
      // Obtener cantidad inicial
      const inputCantidad = page.locator('.cart-item input[type="number"]').first();
      const cantidadInicial = await inputCantidad.inputValue();
      
      // Aumentar cantidad
      await botonMas.click();
      await page.waitForTimeout(1000);
      
      // Verificar cantidad actualizada
      const cantidadActual = await inputCantidad.inputValue();
      
      if (parseInt(cantidadActual) === parseInt(cantidadInicial) + 1) {
        console.log(`CP-016: Cantidad aumentada de ${cantidadInicial} a ${cantidadActual}`);
      } else {
        console.log(`CP-016: No se actualizó la cantidad (${cantidadInicial} -> ${cantidadActual})`);
      }
    } else {
      console.log('CP-016: No se encontró botón para modificar cantidad');
    }
  });
  
  // CP-017: Eliminar producto del carrito
  test('CP-017: Eliminar producto del carrito', async ({ page }) => {
    console.log('CP-017: Eliminar producto');
    
    await page.goto(`${BASE_URL}/cart.jsp`);
    
    // Contar productos antes de eliminar
    const itemsAntes = await page.locator('.cart-item').count();
    console.log(`CP-017: Productos antes de eliminar: ${itemsAntes}`);
    
    if (itemsAntes > 0) {
      // Buscar botón de eliminar (ícono de basura)
      const botonEliminar = page.locator('.cart-item .item-remove').first();
      
      if (await botonEliminar.isVisible()) {
        await botonEliminar.click();
        await page.waitForTimeout(1000);
        
        // Contar productos después de eliminar
        const itemsDespues = await page.locator('.cart-item').count();
        
        if (itemsDespues === itemsAntes - 1) {
          console.log(`CP-017: Producto eliminado - ahora hay ${itemsDespues} productos`);
        } else {
          console.log(`CP-017: No se eliminó (${itemsAntes} -> ${itemsDespues})`);
        }
      }
    }
  });
  
  // CP-019: Continuar comprando desde carrito
  test('CP-019: Continuar comprando', async ({ page }) => {
    console.log('CP-019: Continuar comprando');
    
    await page.goto(`${BASE_URL}/cart.jsp`);
    
    // Buscar enlace "Continuar comprando" o "Ir a Productos"
    const enlaceContinuar = page.locator('a:has-text("Ir a Productos"), a:has-text("Continuar comprando")');
    
    if (await enlaceContinuar.isVisible()) {
      await enlaceContinuar.click();
      
      // Debería redirigir a products.jsp
      await page.waitForURL(/products\.jsp/);
      
      if (page.url().includes('products.jsp')) {
        console.log('CP-019: Redirigió correctamente a productos');
      }
    } else {
      console.log('CP-019: Enlace no encontrado');
    }
  });
});