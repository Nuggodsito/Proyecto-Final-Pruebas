SISTEMA DE PRUEBAS AUTOMATIZADAS - CIRCUBYTE
Descripción
Sistema de pruebas automatizadas implementado con Playwright para el proyecto CircuByte. Cubre 8 casos de uso principales con 21 casos de prueba específicos, validando tanto flujos exitosos como situaciones de error.

Características
-21 pruebas automatizadas organizadas por funcionalidad

-Cobertura completa de casos exitosos y de error

-Evidencias automáticas (screenshots y videos)

-Reportes HTML interactivos

-Ejecución rápida (2-3 minutos para todo el conjunto)

-Configuración para Tomcat local

Estructura del Proyecto
01-registro.spec.js - Pruebas de registro de usuarios

02-login.spec.js - Pruebas de autenticación

03-carrito.spec.js - Pruebas del carrito de compras

04-checkout.spec.js - Pruebas de proceso de compra

05-historial.spec.js - Pruebas de historial de pedidos

06-filtrado.spec.js - Pruebas de filtrado de productos

07-contacto.spec.js - Pruebas de formulario de contacto

Requisitos
Node.js 16+

Google Chrome instalado

Proyecto CircuByte ejecutándose en Tomcat (localhost:8087)

Ejecución
Asegurar que CircuByte esté corriendo

Abrir terminal en la carpeta de pruebas

Ejecutar: npx playwright test

Ver reporte: npx playwright show-report

Resultados
Todas las pruebas se ejecutan automáticamente

Reporte generado en formato HTML

Evidencias guardadas para análisis

Logs detallados en consola

Tiempo total de ejecución: 2-3 minutos
Cobertura: 8 casos de uso, 21 casos de prueba
