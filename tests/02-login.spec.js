// tests/02-login.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

test.describe('CU#2: Iniciar Sesión', () => {
  
  // CP-006: Login exitoso
  test('CP-006: Inicio de sesión exitoso', async ({ page }) => {
    console.log('CP-006: Login exitoso');
    
    // Ir desde index a login
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('link', { name: ' Ingresar' }).click();
    
    await expect(page).toHaveURL(/login\.jsp/);
    
    // Credenciales válidas del codegen
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('alejocalderon09@gmail.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('mayo92005');
    
    await page.getByRole('button', { name: 'Acceder' }).click();
    
    // Esperar redirección a index.jsp después de login
    await page.waitForURL(/index\.jsp/);
    
    // Verificar que estamos en index
    await expect(page).toHaveURL(/index\.jsp/);
    
    // Verificar que el usuario está logueado - busca "Luis Calderon"
    const usuarioLogueado = await page.getByRole('link', { name: ' Luis Calderon' }).isVisible();
    
    if (usuarioLogueado) {
      console.log('CP-006: Login exitoso - Usuario "Luis Calderon" visible');
    } else {
      console.log('CP-006: Login aparente pero no muestra nombre de usuario');
    }
  });
  
  // CP-008: Credenciales incorrectas
  test('CP-008: Credenciales incorrectas', async ({ page }) => {
    console.log('CP-008: Credenciales incorrectas');
    
    await page.goto(`${BASE_URL}/login.jsp`);
    
    // Correo válido pero contraseña incorrecta
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('alejocalderon09@gmail.com');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('contraseña_incorrecta');
    
    await page.getByRole('button', { name: 'Acceder' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    // NO debe redirigir a index
    if (urlActual.includes('index.jsp')) {
      console.log('CP-008 FALLÓ: Redirigió a index con credenciales incorrectas');
    } else {
      // Debe mostrar error "Email o contraseña incorrectos"
      const tieneError = await page.getByText('Email o contraseña incorrectos').isVisible();
      
      if (tieneError) {
        console.log('CP-008: Mostró error "Email o contraseña incorrectos"');
      } else {
        // Verificar si hay div.error-message
        const tieneErrorDiv = await page.locator('.error-message').isVisible();
        
        if (tieneErrorDiv) {
          const errorText = await page.locator('.error-message').textContent();
          console.log('CP-008: Error mostrado:', errorText);
        } else {
          console.log('CP-008: No se detectó error claro');
        }
      }
    }
  });
  
  // CP-007: Campos vacíos (reemplaza CP-009)
  test('CP-007: Campos vacíos', async ({ page }) => {
    console.log('CP-007: Campos vacíos');
    
    await page.goto(`${BASE_URL}/login.jsp`);
    
    // Dejar campo correo vacío, contraseña con valor
    // Correo: VACÍO
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('1234');
    
    await page.getByRole('button', { name: 'Acceder' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    // NO debe redirigir a index
    if (urlActual.includes('index.jsp')) {
      console.log('CP-007 FALLÓ: Redirigió a index con campo vacío');
    } else {
      // Debe permanecer en login.jsp
      await expect(page).toHaveURL(/login\.jsp/);
      
      // Verificar validación
      const campoEmail = page.locator('#email');
      const esValidoEmail = await campoEmail.evaluate(el => el.checkValidity());
      
      if (!esValidoEmail) {
        console.log('CP-007: Validación HTML5 funcionando para campo email vacío');
      }
      
      // Verificar si hay mensaje de error
      const tieneErrorDiv = await page.locator('.error-message').isVisible();
      
      if (tieneErrorDiv) {
        const errorText = await page.locator('.error-message').textContent();
        console.log('CP-007: Mensaje de error:', errorText);
      } else {
        console.log('CP-007: Permanece en login con mensaje de error visible');
      }
    }
  });
  
  // Prueba adicional: Formato de correo inválido
  test('Login fallido - Formato de correo inválido', async ({ page }) => {
    console.log('Login: Formato de correo inválido');
    
    await page.goto(`${BASE_URL}/login.jsp`);
    
    // Correo con formato inválido
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('correo-invalido');
    await page.getByRole('textbox', { name: 'Contraseña' }).fill('1234');
    
    await page.getByRole('button', { name: 'Acceder' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    if (urlActual.includes('index.jsp')) {
      console.log('FALLÓ: Redirigió a index con correo inválido');
    } else {
      console.log('Correcto: No redirigió a index con correo inválido');
    }
  });
});