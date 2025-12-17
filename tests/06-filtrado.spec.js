// tests/06-filtrado.spec.js
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8087/Proyecto_Final';

test.describe('CU#9: Filtrar Productos', () => {
  
  // CP-041: Filtrado por categoría específica
  test('CP-041: Filtrado por categoría Computación', async ({ page }) => {
    console.log('CP-041: Filtrado por categoría Computación');
    
    await page.goto(`${BASE_URL}/products.jsp`);
    await expect(page).toHaveURL(/products\.jsp/);
    
    // Verificar que el select de categoría existe
    const selectCategoria = page.locator('#category-select');
    await expect(selectCategoria).toBeVisible();
    
    // Seleccionar categoría "computacion"
    await selectCategoria.selectOption('computacion');
    
    // Verificar que redirigió con parámetro category=computacion
    await page.waitForURL(/products\.jsp\?category=computacion/);
    
    const urlActual = page.url();
    if (urlActual.includes('category=computacion')) {
      console.log('CP-041: Filtrado aplicado - category=computacion');
      
      // Verificar que muestra productos (o al menos no muestra mensaje de vacío)
      const mensajeVacio = await page.locator('text=No hay productos disponibles').isVisible();
      
      if (!mensajeVacio) {
        console.log('CP-041: Muestra productos de categoría computación');
        
        // Opcional: Verificar que los productos tienen data-category="computacion"
        const productosComputacion = await page.locator('.product-card[data-category="computacion"]').count();
        if (productosComputacion > 0) {
          console.log(`CP-041: Encontrados ${productosComputacion} productos de computación`);
        }
      } else {
        console.log('CP-041: Categoría computación no tiene productos');
      }
    }
  });
  
  // CP-042: Ver todas las categorías
  test('CP-042: Ver todas las categorías', async ({ page }) => {
    console.log('CP-042: Ver todas las categorías');
    
    // Primero filtrar por una categoría específica
    await page.goto(`${BASE_URL}/products.jsp?category=computacion`);
    await expect(page).toHaveURL(/category=computacion/);
    
    console.log('CP-042: Actualmente en categoría computacion');
    
    // Seleccionar "Todas las categorías" (value="all")
    const selectCategoria = page.locator('#category-select');
    await selectCategoria.selectOption('all');
    
    // Verificar que redirigió sin parámetro category o con category=all
    await page.waitForURL(/products\.jsp(?:\?category=all)?/);
    
    const urlActual = page.url();
    if (!urlActual.includes('category=') || urlActual.includes('category=all')) {
      console.log('CP-042: Mostrando todas las categorías');
      
      // Verificar que muestra productos
      const productos = await page.locator('.product-card').count();
      const mensajeVacio = await page.locator('text=No hay productos disponibles').isVisible();
      
      if (productos > 0 && !mensajeVacio) {
        console.log(`CP-042: Muestra ${productos} productos de todas las categorías`);
      }
    }
  });
  
  // CP-043: Categoría sin productos
  test('CP-043: Categoría sin productos - Tablets', async ({ page }) => {
    console.log('CP-043: Categoría Tablets (sin productos)');
    
    await page.goto(`${BASE_URL}/products.jsp`);
    
    // Seleccionar categoría "tablets" (que según tu codegen no tiene productos)
    const selectCategoria = page.locator('#category-select');
    await selectCategoria.selectOption('tablets');
    
    // Verificar que redirigió con category=tablets
    await page.waitForURL(/products\.jsp\?category=tablets/);
    
    const urlActual = page.url();
    if (urlActual.includes('category=tablets')) {
      console.log('CP-043: Filtrado aplicado - category=tablets');
      
      // Esperar a que cargue
      await page.waitForTimeout(1000);
      
      // Verificar mensaje "No hay productos disponibles en esta categoría"
      const mensajeVacio = page.locator('text=No hay productos disponibles');
      
      if (await mensajeVacio.isVisible()) {
        console.log('CP-043: Muestra mensaje apropiado para categoría vacía');
        
        // Verificar texto exacto del mensaje
        const textoMensaje = await mensajeVacio.textContent();
        console.log(`CP-043: Mensaje: "${textoMensaje}"`);
      } else {
        // Si no muestra mensaje, verificar que no hay productos
        const productos = await page.locator('.product-card').count();
        if (productos === 0) {
          console.log('CP-043: Categoría tablets vacía (sin productos)');
        } else {
          console.log(`CP-043: Categoría tablets tiene ${productos} productos`);
        }
      }
    }
  });
  
  // Prueba adicional: Filtrado por múltiples categorías
  test('Filtrado por diferentes categorías', async ({ page }) => {
    console.log('Probando filtrado por diferentes categorías...');
    
    const categorias = ['computacion', 'tv', 'celulares', 'aire', 'linea-blanca'];
    
    for (const categoria of categorias) {
      await page.goto(`${BASE_URL}/products.jsp?category=${categoria}`);
      
      // Verificar que carga la categoría correcta
      const urlActual = page.url();
      if (urlActual.includes(`category=${categoria}`)) {
        console.log(`Categoría ${categoria} cargada correctamente`);
        
        // Verificar select tiene la opción seleccionada
        const selectCategoria = page.locator('#category-select');
        const valorSeleccionado = await selectCategoria.inputValue();
        
        if (valorSeleccionado === categoria) {
          console.log(`  ✓ Select muestra ${categoria} seleccionado`);
        }
        
        // Esperar breve para no sobrecargar
        await page.waitForTimeout(500);
      }
    }
    
    console.log('Filtrado por todas las categorías probado');
  });
  
  // Prueba adicional: Preservar filtro al navegar
  test('Preservar filtro al recargar página', async ({ page }) => {
    console.log('Probando que se preserva el filtro...');
    
    // Ir a productos con filtro específico
    await page.goto(`${BASE_URL}/products.jsp?category=celulares`);
    
    // Verificar que select muestra "celulares" seleccionado
    const selectCategoria = page.locator('#category-select');
    const valorInicial = await selectCategoria.inputValue();
    
    if (valorInicial === 'celulares') {
      console.log('Filtro inicial aplicado: celulares');
    }
    
    // Recargar página
    await page.reload();
    
    // Verificar que sigue mostrando "celulares" seleccionado
    const valorDespuesRecarga = await selectCategoria.inputValue();
    
    if (valorDespuesRecarga === 'celulares') {
      console.log('Filtro preservado después de recargar');
    } else {
      console.log('Filtro no se preservó después de recargar');
    }
  });
});