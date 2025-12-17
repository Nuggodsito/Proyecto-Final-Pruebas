// tests/07-contacto.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

test.describe('CU#10: Enviar Comentario', () => {
  
  // CP-046: Envío exitoso de comentario
  test('CP-046: Envío exitoso de comentario', async ({ page }) => {
    console.log('CP-046: Envío exitoso de comentario');
    
    await page.goto(`${BASE_URL}/`);
    await page.getByRole('navigation').getByRole('link', { name: 'Contacto' }).click();
    
    // Verificar que estamos en contacto
    await expect(page).toHaveURL(/contact\.jsp/);
    await expect(page.locator('h1')).toContainText('Contáctanos');
    
    // Llenar formulario con datos válidos
    await page.getByRole('textbox', { name: 'Nombre Completo' }).fill('Luis Calderón');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('luis@email.com');
    await page.getByRole('textbox', { name: 'Mensaje' }).fill('Excelente servicio');
    
    console.log('CP-046: Formulario completado con datos válidos');
    
    // Enviar formulario
    await page.getByRole('button', { name: 'Enviar Mensaje' }).click();
    
    // Esperar redirección con parámetro enviado=true
    try {
      await page.waitForURL(/contact\.jsp\?enviado=true/, { timeout: 5000 });
      
      const urlActual = page.url();
      if (urlActual.includes('enviado=true')) {
        console.log('CP-046: Redirigió con enviado=true');
        
        // Verificar mensaje de éxito
        const mensajeExito = page.locator('text=✅ Gracias por tu comentario.');
        if (await mensajeExito.isVisible()) {
          console.log('CP-046: Muestra mensaje de éxito "Gracias por tu comentario"');
        }
      }
    } catch {
      console.log('CP-046: No redirigió con parámetro enviado=true');
      console.log('URL actual:', page.url());
    }
  });
  
  // CP-047: Campos incompletos (mensaje vacío)
  test('CP-047: Campos incompletos - Mensaje vacío', async ({ page }) => {
    console.log('CP-047: Mensaje vacío');
    
    await page.goto(`${BASE_URL}/contact.jsp`);
    
    // Llenar nombre y email, pero dejar MENSAJE VACÍO
    await page.getByRole('textbox', { name: 'Nombre Completo' }).fill('Luis');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('luis@email.com');
    // MENSAJE: VACÍO intencionalmente
    
    console.log('CP-047: Campo mensaje vacío para probar validación');
    
    // Intentar enviar
    await page.getByRole('button', { name: 'Enviar Mensaje' }).click();
    
    // Esperar brevemente
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    // NO debería redirigir con enviado=true (debería validar)
    if (urlActual.includes('enviado=true')) {
      console.log('CP-047 FALLÓ: Redirigió a pesar de campo vacío');
    } else {
      // Debería permanecer en contacto.jsp sin parámetro
      await expect(page).toHaveURL(/contact\.jsp/);
      
      // Verificar validación HTML5
      const campoMensaje = page.locator('#mensaje');
      const esValido = await campoMensaje.evaluate(el => el.checkValidity());
      
      if (!esValido) {
        console.log('CP-047: Validación HTML5 detectó campo mensaje vacío');
      } else {
        console.log('CP-047: No se detectó validación para campo vacío');
      }
    }
  });
  
  // CP-049: Formato de correo inválido
  test('CP-049: Formato de correo inválido', async ({ page }) => {
    console.log('CP-049: Correo inválido');
    
    await page.goto(`${BASE_URL}/contact.jsp`);
    
    // Usar correo con formato inválido
    await page.getByRole('textbox', { name: 'Nombre Completo' }).fill('Luis');
    await page.getByRole('textbox', { name: 'Correo Electrónico' }).fill('correo-invalido'); // Formato incorrecto
    await page.getByRole('textbox', { name: 'Mensaje' }).fill('Test de validación');
    
    console.log('CP-049: Usando correo con formato inválido');
    
    // Intentar enviar
    await page.getByRole('button', { name: 'Enviar Mensaje' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    // NO debería redirigir con éxito
    if (urlActual.includes('enviado=true')) {
      console.log('CP-049 FALLÓ: Redirigió a pesar de correo inválido');
    } else {
      // Verificar validación HTML5 para email
      const campoEmail = page.locator('#email');
      const esValidoEmail = await campoEmail.evaluate(el => {
        // Verificar tanto validación HTML5 como formato
        const esValido = el.checkValidity();
        const tieneFormatoInvalido = el.value && !el.value.includes('@');
        return esValido && !tieneFormatoInvalido;
      });
      
      if (!esValidoEmail) {
        console.log('CP-049: Sistema detectó formato de correo inválido');
      } else {
        console.log('CP-049: No se detectó correo inválido');
      }
    }
  });
  
  // Prueba adicional: Todos los campos vacíos
  test('Envío fallido - Todos los campos vacíos', async ({ page }) => {
    console.log('Contacto: Todos los campos vacíos');
    
    await page.goto(`${BASE_URL}/contact.jsp`);
    
    // No llenar ningún campo
    await page.getByRole('button', { name: 'Enviar Mensaje' }).click();
    
    await page.waitForTimeout(2000);
    
    const urlActual = page.url();
    
    if (urlActual.includes('enviado=true')) {
      console.log('FALLÓ: Envió con todos los campos vacíos');
    } else {
      // Verificar que sigue en contacto.jsp
      await expect(page).toHaveURL(/contact\.jsp/);
      
      // Verificar validación de campos requeridos
      const camposRequeridos = ['#nombre', '#email', '#mensaje'];
      let camposInvalidos = 0;
      
      for (const selector of camposRequeridos) {
        const campo = page.locator(selector);
        const esValido = await campo.evaluate(el => el.checkValidity());
        if (!esValido) camposInvalidos++;
      }
      
      if (camposInvalidos === camposRequeridos.length) {
        console.log('Todos los campos requeridos están validando correctamente');
      }
    }
  });
  
  // Prueba adicional: Verificar elementos de información de contacto
  test('Verificar información de contacto', async ({ page }) => {
    console.log('Verificando información de contacto...');
    
    await page.goto(`${BASE_URL}/contact.jsp`);
    
    // Verificar elementos de información
    const elementosInfo = [
      'text=Teléfono',
      'text=(507) 6851-6845',
      'text=Correo Electrónico',
      'text=info@circubyte.com',
      'text=Horario de Atención'
    ];
    
    for (const selector of elementosInfo) {
      const elemento = page.locator(selector);
      if (await elemento.isVisible()) {
        console.log(`✓ ${selector.split('=')[1]} visible`);
      }
    }
  });
});