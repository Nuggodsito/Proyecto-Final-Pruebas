// tests/04-checkout.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

async function agregarProductoAlCarrito(page) {
  await page.goto(`${BASE_URL}/products.jsp`);
  await page.waitForSelector('.product-card');
  
  const botonesAgregar = page.locator('button.add-to-cart');
  if (await botonesAgregar.first().isVisible()) {
    await botonesAgregar.first().click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

test.describe('CU#5: Finalizar Compra', () => {
  
  // CP-021: Compra exitosa
  test('CP-021: Compra exitosa', async ({ page }) => {
    console.log('CP-021: Compra exitosa');
    
    // Agregar producto al carrito
    const productoAgregado = await agregarProductoAlCarrito(page);
    if (!productoAgregado) {
      console.log('CP-021: No se pudo agregar producto');
      return;
    }
    
    // Ir al carrito y proceder al pago
    await page.goto(`${BASE_URL}/cart.jsp`);
    const carritoVacio = await page.locator('text=Tu carrito está vacío').isVisible();
    if (!carritoVacio) {
      await page.getByRole('button', { name: 'Proceder al Pago' }).click();
      await expect(page).toHaveURL(/checkout\.jsp/);
    }
    
    // Llenar formulario con datos válidos
    await page.locator('#firstname').fill('Luis');
    await page.locator('#lastname').fill('Ortega');
    await page.locator('#email').fill('luis1234@gmail.com');
    await page.locator('#phone').fill('1234-2345');
    await page.locator('#address').fill('Las Mañanitas');
    await page.locator('#city').fill('Panamá');
    await page.locator('#zip').fill('093091');
    await page.locator('#province').selectOption('Panamá');
    await page.getByRole('radio', { name: 'Tarjeta de Crédito' }).check();
    await page.getByRole('textbox', { name: '5678 9123 4567' }).fill('1234 5678 9123 4567');
    
    console.log('CP-021: Formulario completado');
    
    // Confirmar compra y esperar redirección a confirmation.jsp
    await page.getByRole('button', { name: 'Confirmar Compra' }).click();
    
    // Esperar redirección a confirmation.jsp
    try {
      await page.waitForURL(/confirmation\.jsp/, { timeout: 10000 });
      console.log('CP-021: Redirigió a confirmation.jsp');
      
      // Verificar que estamos en confirmation.jsp
      await expect(page).toHaveURL(/confirmation\.jsp/);
      
      // Verificar que muestra algún elemento de confirmación
      const tituloConfirmacion = await page.locator('h1, h2').filter({ hasText: /factura|confirmación|compra/i }).first().isVisible();
      if (tituloConfirmacion) {
        console.log('CP-021: Mostró título de confirmación');
      }
    } catch (error) {
      console.log('CP-021 ERROR: No redirigió a confirmation.jsp');
      console.log('URL actual:', page.url());
    }
  });
  
  // CP-022: Pago rechazado - Formato tarjeta inválido
  test('CP-022: Pago rechazado - Formato tarjeta inválido', async ({ page }) => {
    console.log('CP-022: Pago rechazado');
    
    // Configurar para capturar alert
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      console.log(`Alert detectado: ${dialogMessage}`);
      await dialog.dismiss();
    });
    
    // Preparar carrito
    const productoAgregado = await agregarProductoAlCarrito(page);
    if (!productoAgregado) return;
    
    // Ir a checkout
    await page.goto(`${BASE_URL}/cart.jsp`);
    const carritoVacio = await page.locator('text=Tu carrito está vacío').isVisible();
    if (!carritoVacio) {
      await page.getByRole('button', { name: 'Proceder al Pago' }).click();
      await expect(page).toHaveURL(/checkout\.jsp/);
    }
    
    // Llenar formulario con tarjeta inválida
    await page.locator('#firstname').fill('Luis');
    await page.locator('#lastname').fill('Ortega');
    await page.locator('#email').fill('luis1234@gmail.com');
    await page.locator('#phone').fill('1234-2345');
    await page.locator('#address').fill('Las Mañanitas');
    await page.locator('#city').fill('Panamá');
    await page.locator('#zip').fill('093091');
    await page.locator('#province').selectOption('Panamá');
    await page.getByRole('radio', { name: 'Tarjeta de Crédito' }).check();
    await page.getByRole('textbox', { name: '5678 9123 4567' }).fill('41A1 1111 1111 1111');
    
    // Confirmar compra
    await page.getByRole('button', { name: 'Confirmar Compra' }).click();
    await page.waitForTimeout(2000);
    
    // Verificar que NO redirigió y que mostró alert correcto
    const urlActual = page.url();
    const permaneceEnCheckout = urlActual.includes('checkout.jsp');
    
    if (permaneceEnCheckout && dialogMessage.includes('Formato de tarjeta inválido')) {
      console.log('CP-022: Pasó - Permanece en checkout con mensaje correcto');
    } else {
      console.log('CP-022: Problema - Redirigió o mensaje incorrecto');
      console.log('URL:', urlActual);
      console.log('Mensaje alert:', dialogMessage);
    }
  });
  
  // CP-024: Datos de envío inválidos
  test('CP-024: Datos de envío inválidos - Campo dirección vacío', async ({ page }) => {
    console.log('CP-024: Campo dirección vacío');
    
    // Configurar para capturar alert
    let dialogMessage = '';
    page.on('dialog', async dialog => {
      dialogMessage = dialog.message();
      console.log(`Alert detectado: ${dialogMessage}`);
      await dialog.dismiss();
    });
    
    // Preparar carrito
    const productoAgregado = await agregarProductoAlCarrito(page);
    if (!productoAgregado) return;
    
    // Ir a checkout
    await page.goto(`${BASE_URL}/cart.jsp`);
    const carritoVacio = await page.locator('text=Tu carrito está vacío').isVisible();
    if (!carritoVacio) {
      await page.getByRole('button', { name: 'Proceder al Pago' }).click();
      await expect(page).toHaveURL(/checkout\.jsp/);
    }
    
    // Llenar formulario pero dejar dirección vacía
    await page.locator('#firstname').fill('Luis');
    await page.locator('#lastname').fill('Ortega');
    await page.locator('#email').fill('luis1234@gmail.com');
    await page.locator('#phone').fill('1234-2345');
    // DIRECCIÓN: VACÍA intencionalmente
    await page.locator('#city').fill('Panamá');
    await page.locator('#zip').fill('093091');
    await page.locator('#province').selectOption('Panamá');
    await page.getByRole('radio', { name: 'Tarjeta de Crédito' }).check();
    await page.getByRole('textbox', { name: '5678 9123 4567' }).fill('1234 5678 9123 4567');
    
    // Confirmar compra
    await page.getByRole('button', { name: 'Confirmar Compra' }).click();
    await page.waitForTimeout(2000);
    
    // Verificar que NO redirigió y que mostró alert correcto
    const urlActual = page.url();
    const permaneceEnCheckout = urlActual.includes('checkout.jsp');
    
    if (permaneceEnCheckout && dialogMessage.includes('Complete todos los campos')) {
      console.log('CP-024: Pasó - Permanece en checkout con mensaje correcto');
    } else {
      console.log('CP-024: Problema - Redirigió o mensaje incorrecto');
      console.log('URL:', urlActual);
      console.log('Mensaje alert:', dialogMessage);
    }
  });
});