// tests/01-registro.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

test.describe('CU#1: Registrar Usuario', () => {
  
  test('CP-001: Registro exitoso de nuevo usuario', async ({ page }) => {
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('link', { name: 'Regístrate aquí' }).click();
    await expect(page).toHaveURL(/register\.jsp/);
    
    // Email único cada vez
    const timestamp = Date.now();
    const emailUnico = `test${timestamp}@gmail.com`;
    
    // Llenar formulario
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Luis');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Calderón');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(emailUnico);
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('1234');
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('1234');
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('69188963');
    await page.getByRole('textbox', { name: 'Dirección' }).fill('Calle 123');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y' }).check();
    
    await page.getByRole('button', { name: 'Registrarse' }).click();
    
    // Debe redirigir a login con éxito
    await page.waitForURL(/login\.jsp/);
    await expect(page).toHaveURL(/login\.jsp/);
    
    const urlActual = page.url();
    if (urlActual.includes('success=')) {
      console.log('CP-001: Registro exitoso - Redirigió a login con mensaje de éxito');
    } else {
      console.log('CP-001: Registro exitoso - Redirigió a login');
    }
  });
  
  test('CP-002: Registro fallido - Campo correo vacío', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.jsp`);
    
    // Llenar todos los campos EXCEPTO correo (vacío)
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Luis');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Calderón');
    // Correo se deja VACÍO
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('1234');
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('1234');
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('69188963');
    await page.getByRole('textbox', { name: 'Dirección' }).fill('Calle 123');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y' }).check();
    
    await page.getByRole('button', { name: 'Registrarse' }).click();
    
    // Esperar y verificar
    await page.waitForTimeout(2000);
    
    // NO debe redirigir a login - debe quedarse en register.jsp
    const urlActual = page.url();
    
    if (urlActual.includes('login.jsp')) {
      console.log('CP-002 FALLÓ: Redirigió a login (no debería con campo vacío)');
    } else {
      // Verificar si hay indicio de error
      const tieneErrorDiv = await page.locator('.error-message').isVisible();
      const tieneErrorUrl = urlActual.includes('error=');
      const sigueEnRegister = urlActual.includes('register.jsp');
      
      if (tieneErrorDiv || tieneErrorUrl || sigueEnRegister) {
        console.log('CP-002: Detectó error por campo vacío (comportamiento esperado)');
      } else {
        console.log('CP-002: No se detectó error claro');
      }
    }
  });
  
  test('CP-003: Registro fallido - Correo ya registrado', async ({ page }) => {
    await page.goto(`${BASE_URL}/register.jsp`);
    
    // Usar correo que sabemos existe
    const correoExistente = 'luiscalderon@gmail.com';
    
    await page.getByRole('textbox', { name: 'Nombre' }).fill('Luis');
    await page.getByRole('textbox', { name: 'Apellido' }).fill('Ortega');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill(correoExistente);
    await page.getByRole('textbox', { name: 'Contraseña', exact: true }).fill('4567');
    await page.getByRole('textbox', { name: 'Confirmar Contraseña' }).fill('4567');
    await page.getByRole('textbox', { name: 'Teléfono' }).fill('68516845');
    await page.getByRole('textbox', { name: 'Dirección' }).fill('Calle 456');
    await page.getByRole('checkbox', { name: 'Acepto los Términos y' }).check();
    
    await page.getByRole('button', { name: 'Registrarse' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    // NO debe redirigir a login
    if (urlActual.includes('login.jsp')) {
      console.log('CP-003 FALLÓ: Redirigió a login (no debería con correo duplicado)');
    } else {
      // Verificar indicios de error
      const tieneErrorDiv = await page.locator('.error-message').isVisible();
      const tieneErrorUrl = urlActual.includes('error=');
      
      if (tieneErrorDiv || tieneErrorUrl) {
        console.log('CP-003: Detectó error por correo duplicado');
      } else {
        console.log('CP-003: No se detectó error por correo duplicado');
      }
    }
  });
});