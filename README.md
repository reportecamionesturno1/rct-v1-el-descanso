# RCT – Mina El Descanso (rct-v1-el-descanso)

Este repositorio contiene la **versión 1** del sistema de **Reporte de Cambio de Turno (RCT)** para la mina **El Descanso**.  
El objetivo es contar con una herramienta digital sencilla, rápida y usable desde computador o celular para registrar la información clave del cambio de turno.

> Proyecto en desarrollo continuo. Esta es una versión inicial orientada a pruebas y mejoras iterativas.

---

## 🚀 Demo en línea

Puedes visualizar esta versión en GitHub Pages:

👉 **https://reportecamionesturno1.github.io/rct-v1-el-descanso/**  

Repositorio:

👉 **https://github.com/reportecamionesturno1/rct-v1-el-descanso**

---

## 🧾 Funcionalidades principales (V1)

- Formulario tipo **wizard** por pasos:
  - Encabezado del reporte (fecha, grupo, turno, supervisores, responsable).
  - Registro de **hora de llegada de buses a bahías**.
  - Registro de **equipos varados en campo**.
  - Registro de **comentarios / hallazgos de seguridad**.
  - Resumen final para firma y exportación.
- **Almacenamiento local** mediante `localStorage` para no perder la información si se recarga la página.
- Panel de **KPIs** básicos (operativos, down, hallazgos, disponibilidad %).
- **Tema claro / oscuro** (toggle visual).
- Preparado para **multiidioma** (ES/EN) mediante archivos JSON.
- Exportación del reporte en varios formatos:
  - **Impresión directa** (vista optimizada tipo formato oficial).
  - **PDF** en horizontal tamaño carta.
  - **JPG** de la vista de impresión.
  - **Excel (XLSX)** con tablas estructuradas.
  - **CSV** (buses).
  - **JSON** (estado completo del reporte).

---

## 🧱 Estructura básica del proyecto

```text
rct-v1-el-descanso/
├── index.html      # Estructura principal de la app web
├── style.css       # Estilos generales y diseño impresión/tema oscuro
├── script.js       # Lógica del formulario, estado y exportaciones
├── config.js       # (Opcional) Configuración adicional del proyecto
└── assets/
    ├── img/
    │   ├── logo_drummond.png
    │   └── yo-estoy-con.png
    └── lang/
        ├── es.json
        └── en.json
