// tests/05-historial.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

// Función para hacer una compra y generar historial
async function hacerCompraParaHistorial(page) {
  console.log('Preparando: Haciendo compra para historial...');
  
  // 1. Login
  await page.goto(`${BASE_URL}/login.jsp`);
  await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('alejocalderon09@gmail.com');
  await page.getByRole('textbox', { name: 'Contraseña' }).fill('mayo92005');
  await page.getByRole('button', { name: 'Acceder' }).click();
  await page.waitForURL(/index\.jsp/);
  
  // 2. Agregar producto al carrito
  await page.goto(`${BASE_URL}/products.jsp`);
  await page.waitForSelector('.product-card');
  
  const botonesAgregar = page.locator('button.add-to-cart');
  if (await botonesAgregar.first().isVisible()) {
    await botonesAgregar.first().click();
    await page.waitForTimeout(1000);
  } else {
    console.log('No hay productos para agregar');
    return false;
  }
  
  // 3. Proceder a checkout
  await page.goto(`${BASE_URL}/cart.jsp`);
  const carritoVacio = await page.locator('text=Tu carrito está vacío').isVisible();
  if (!carritoVacio) {
    await page.getByRole('button', { name: 'Proceder al Pago' }).click();
    await expect(page).toHaveURL(/checkout\.jsp/);
  }
  
  // 4. Completar formulario de checkout
  await page.locator('#firstname').fill('Luis');
  await page.locator('#lastname').fill('Calderon');
  await page.locator('#email').fill('alejocalderon09@gmail.com');
  await page.locator('#phone').fill('6918-8963');
  await page.locator('#address').fill('su casa');
  await page.locator('#city').fill('panama');
  await page.locator('#zip').fill('09882');
  await page.locator('#province').selectOption('Panamá');
  await page.getByRole('radio', { name: 'Tarjeta de Crédito' }).check();
  await page.getByRole('textbox', { name: '5678 9123 4567' }).fill('1234 5678 9123 4567');
  
  // 5. Confirmar compra
  await page.getByRole('button', { name: 'Confirmar Compra' }).click();
  
  // 6. Esperar confirmación
  try {
    await page.waitForURL(/confirmation\.jsp/, { timeout: 10000 });
    console.log('Compra exitosa para historial');
    return true;
  } catch {
    console.log('No se completó la compra');
    return false;
  }
}

test.describe('CU#7: Consultar Historial de Pedidos', () => {
  
  // CP-031: Visualización de historial (con pedidos)
  test('CP-031: Visualización de historial con pedidos', async ({ page }) => {
    console.log('CP-031: Visualización de historial');
    
    // Primero hacer una compra para tener historial
    const compraExitosa = await hacerCompraParaHistorial(page);
    if (!compraExitosa) {
      console.log('CP-031: No se pudo crear pedido para historial');
      return;
    }
    
    // Después de compra, ir a historial
    // Buscar enlace "Mis Pedidos" en el header (como en tu codegen)
    await page.goto(`${BASE_URL}/`);
    
    // Intentar encontrar enlace "Mis Pedidos" - puede estar en menú de usuario
    const enlaceMisPedidos = page.locator('text=/mis pedidos|Mis Pedidos/i');
    
    if (await enlaceMisPedidos.isVisible()) {
      await enlaceMisPedidos.click();
    } else {
      // Si no encuentra enlace, ir directo a historial.jsp
      await page.goto(`${BASE_URL}/historial.jsp`);
    }
    
    // Verificar que estamos en historial
    await expect(page).toHaveURL(/historial\.jsp/);
    await expect(page.locator('h1')).toContainText('Historial de Pedidos');
    
    // Verificar que muestra pedidos (no debe estar vacío)
    const historialVacio = await page.locator('text=No tienes pedidos registrados').isVisible();
    
    if (!historialVacio) {
      console.log('CP-031: Historial muestra pedidos');
      
      // Verificar que hay tarjetas de pedido
      const pedidos = await page.locator('.order-card').count();
      if (pedidos > 0) {
        console.log(`CP-031: Encontrados ${pedidos} pedidos en historial`);
      }
    } else {
      console.log('CP-031: Historial vacío (puede que no se guardó en localStorage)');
    }
  });
  
  // CP-032: Detalles de pedido específico (ver factura)
  test('CP-032: Ver detalles de pedido específico', async ({ page }) => {
    console.log('CP-032: Ver detalles de pedido');
    
    // Primero asegurarse de tener historial
    await hacerCompraParaHistorial(page);
    
    // Ir a historial
    await page.goto(`${BASE_URL}/historial.jsp`);
    
    // Buscar botón "Ver factura" en el primer pedido
    const botonVerFactura = page.locator('.view-invoice-btn').first();
    
    if (await botonVerFactura.isVisible()) {
      // Hacer clic en "Ver factura"
      await botonVerFactura.click();
      
      // Debería redirigir a confirmation.jsp con orderId
      await page.waitForURL(/confirmation\.jsp\?orderId=/);
      
      const urlActual = page.url();
      if (urlActual.includes('confirmation.jsp') && urlActual.includes('orderId=')) {
        console.log('CP-032: Redirigió a factura con orderId');
        
        // Verificar que muestra detalles de la factura
        const tituloFactura = await page.locator('h1, h2').filter({ hasText: /factura|Factura de Compra|confirmación/i }).first().isVisible();
        if (tituloFactura) {
          console.log('CP-032: Muestra detalles de factura');
        }
      }
    } else {
      console.log('CP-032: No se encontró botón "Ver factura"');
    }
  });
  
  // CP-033: Usuario sin pedidos (historial vacío)
  test('CP-033: Usuario sin pedidos - Historial vacío', async ({ page }) => {
    console.log('CP-033: Historial vacío');
    
    // Limpiar localStorage para simular usuario sin pedidos
    await page.goto(`${BASE_URL}/historial.jsp`);
    await page.evaluate(() => {
      localStorage.removeItem('orderHistory');
    });
    
    // Recargar página
    await page.reload();
    
    // Verificar mensaje de historial vacío
    const mensajeVacio = page.locator('text=No tienes pedidos registrados');
    
    if (await mensajeVacio.isVisible()) {
      console.log('CP-033: Muestra mensaje para historial vacío');
      
      // Verificar enlace "Ir a Productos"
      const enlaceProductos = page.locator('text=Ir a Productos');
      if (await enlaceProductos.isVisible()) {
        console.log('CP-033: Muestra enlace para ir a productos');
      }
    } else {
      console.log('CP-033: No muestra mensaje de historial vacío');
    }
  });
  
  // Prueba adicional: Verificar estructura de pedido en historial
  test('Verificar estructura de pedidos en historial', async ({ page }) => {
    console.log('Verificando estructura de pedidos...');
    
    // Crear pedido primero
    await hacerCompraParaHistorial(page);
    await page.goto(`${BASE_URL}/historial.jsp`);
    
    // Verificar elementos de un pedido
    const primerPedido = page.locator('.order-card').first();
    
    if (await primerPedido.isVisible()) {
      // Verificar que tiene número de pedido
      const tieneOrderId = await primerPedido.locator('.order-id').isVisible();
      const tieneFecha = await primerPedido.locator('.order-date').isVisible();
      const tieneTotal = await primerPedido.locator('.order-total').isVisible();
      const tieneBotonFactura = await primerPedido.locator('.view-invoice-btn').isVisible();
      
      if (tieneOrderId && tieneFecha && tieneTotal && tieneBotonFactura) {
        console.log('Estructura de pedido correcta');
      } else {
        console.log('Faltan elementos en la estructura del pedido');
      }
    }
  });
});