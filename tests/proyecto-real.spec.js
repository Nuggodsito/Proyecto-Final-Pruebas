// tests/proyecto-real.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

test('Probar página principal del proyecto', async ({ page }) => {
  await page.goto(`${BASE_URL}/index.jsp`);
  
  await expect(page).toHaveTitle('HOME - CircuByte | ElectroShop');
  
  await expect(page.locator('h1')).toContainText('Bienvenido a CircuByte');
  
  await page.screenshot({ path: 'pagina-principal.png' });
  
  await expect(page.locator('text=Ver Productos')).toBeVisible();
  
  console.log('Página principal verificada correctamente');
  console.log('Screenshot: pagina-principal.png');
});

test('Navegar a productos', async ({ page }) => {
  await page.goto(`${BASE_URL}/index.jsp`);
  
  await page.click('text=Ver Productos');
  
  await page.screenshot({ path: 'pagina-productos.png' });
  
  console.log('Navegación a productos verificada');
});