SISTEMA DE PRUEBAS AUTOMATIZADAS - CIRCUBYTE
Descripción General
Sistema de pruebas automatizadas implementado con Playwright para el proyecto CircuByte. Este sistema valida automáticamente todas las funcionalidades principales de la aplicación web, proporcionando cobertura completa de pruebas tanto para flujos exitosos como para casos de error.

Características Principales
21 pruebas automatizadas organizadas por módulos funcionales

Cobertura completa de 8 casos de uso principales

Evidencias automáticas incluyendo capturas de pantalla y videos

Reportes interactivos en formato HTML con filtros y búsqueda

Ejecución rápida - Todo el conjunto en 2-3 minutos

Configuración específica para entorno Tomcat local

Módulos de Prueba Implementados
Autenticación
Registro de Usuario: Validación de nuevo registro, campos obligatorios y correos duplicados

Inicio de Sesión: Pruebas de autenticación exitosa, credenciales incorrectas y validaciones

Gestión de Productos
Carrito de Compras: Agregar productos, modificar cantidades y eliminar items

Filtrado de Productos: Navegación por categorías y manejo de categorías vacías

Proceso de Compra
Checkout Completo: Flujo completo de compra con datos de envío y pago

Validaciones de Pago: Pruebas de tarjetas inválidas y datos incompletos

Funcionalidades Adicionales
Historial de Pedidos: Consulta de compras anteriores y detalles específicos

Formulario de Contacto: Envío de comentarios y validación de campos

Requisitos del Sistema
Software Requerido
Node.js versión 16 o superior

Google Chrome navegador instalado y actualizado

Apache Tomcat para ejecutar la aplicación CircuByte

Proyecto CircuByte desplegado en localhost:8087

Configuración del Proyecto
La aplicación debe estar accesible en http://localhost:8087/Proyecto_Final/

Base de datos con datos de prueba para productos y usuarios

Conexión a internet para descarga de dependencias

Instalación y Configuración
Instalar Node.js desde el sitio oficial

Crear carpeta para el proyecto de pruebas

Abrir terminal en la carpeta creada

Ejecutar comando: npm init playwright@latest

Flujo de Ejecución
Iniciar la aplicación CircuByte en Tomcat

Abrir terminal en la carpeta de pruebas

Ejecutar comando deseado

Esperar finalización de pruebas

Revisar reportes generados

Configurar URL en playwright.config.js

Verificar conexión con la aplicación local
