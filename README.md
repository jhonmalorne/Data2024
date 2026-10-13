# Orden y Gestión Urbana · *Por una convivencia sana*

Sistema web para que el **encargado de condominio** controle pagos, incidentes, reservas, mantenimiento, visitas y comunicación desde un solo lugar. Condominio modelo de la demo: **Quintas 2000** (Buenaventura, manzana 10, municipio Los Guayos, estado Carabobo), con 20 familias.

> Una solución de **Nexus Marketing** · En alianza con Concertación Ciudadana.

## Qué incluye

| Módulo | Qué hace |
|---|---|
| **Inicio** | Panel con solvencia, cobranza del mes, tickets abiertos/vencidos, próximas reservas, cartelera y alertas del encargado. |
| **Pagos** | Control mensual de las 20 familias, historial de 12 meses, recibos imprimibles (PDF), recordatorio de cobro por WhatsApp, exportación a CSV, QR de pagos, **reporte de pago con captura** por el vecino y **conciliación asistida** (pega el texto del banco y detecta referencia, monto, vivienda y método; avisa de duplicados). |
| **Cuentas claras (Open Books)** | Totales recaudados, gastos con proveedor, fondo de reserva y morosidad, sin mostrar datos sensibles de cada vivienda. |
| **Tickets de atención** | El vecino reporta con foto; el ticket recibe número (OGU-0001…), cuenta regresiva de **24 horas** para la primera respuesta, alerta roja si vence, asignación a conserje/jardinero/proveedor y aviso por WhatsApp. |
| **Reservas** | Calendario mensual con salón, churuata y cancha. Las reservas quedan **visibles** (confirmadas y pendientes), con detección de choques de horario y depósito de garantía. Incluye el ejemplo: *Andrez Tapisquent, piso 1, 19 de octubre de 2026, 9:00 am – 10:00 pm.* |
| **Cartelera y normas** | Avisos del encargado y reglamento de convivencia. |
| **Votaciones** | Consultas digitales, un voto por vivienda, participación y resultados. |
| **Mantenimiento** | Bitácora preventiva (bomba, portón, planta, fumigación, tanque, jardinería) con alertas de vencimiento. |
| **Visitas** | Pase con código QR temporal y validación en garita. |
| **Sugerencias** | Buzón que **abre WhatsApp** con el mensaje listo para la central (o correo). |
| **Asistente** | Bot de preguntas frecuentes: “¿cuánto debo?”, horarios, camión del agua, reservas, contactos. |
| **Contactos y mapa** | Central, denuncias, vigilante, jardinero y mapa con el municipio Los Guayos resaltado (usa el GeoJSON ADM2 del repo). |

Hay dos modos: **residente** (elige “Mi quinta” arriba) y **encargado** (botón “Soy el encargado”, PIN de demo `2000`, configurable en `data.js`).

## Estructura del repositorio

```
OrdenyGestionUrbana/
├── index.html      ← estructura de la página
├── styles.css      ← estilos (responsive, impresión de recibos)
├── data.js         ← configuración y datos de demo (edita aquí)
├── app.js          ← toda la lógica
├── README.md
├── Orden y gestion Urbana.png      (logo, ya subido)
├── Logo de concertacion.png        (logo, ya subido)
├── Imagen superior.jpg             (banner, ya subido)
├── QR para pagos.png               (QR de pagos, ya subido)
├── icono de facebook.jpg · icono de instagram.jpg
├── icono de whatsaap.jpg · icono tiktok.png
└── geoBoundaries-VEN-ADM1_simplified.geojson · geoBoundaries-VEN-ADM2_simplified.geojson
```

Las imágenes y mapas se cargan desde las URLs del repositorio `jhonmalorne/OrdenyGestionUrbana` (rama `main`), por lo que no hay que moverlas.

## Publicarlo en GitHub Pages

1. Sube `index.html`, `styles.css`, `data.js`, `app.js` y `README.md` a la raíz del repositorio.
2. En **Settings → Pages**, elige la rama `main` y la carpeta `/ (root)`.
3. Abre `https://jhonmalorne.github.io/OrdenyGestionUrbana/`.

## Adaptarlo a otro condominio (para vender)

Todo lo específico está en `data.js`: nombre y dirección, cuota, número de viviendas/familias, teléfonos, correo, áreas reservables y depósitos, normas, horarios y redes. Para un cliente nuevo se copia el repositorio y se cambia ese archivo.

## Límites de esta versión (importante)

- **Es una demo del lado del navegador:** los datos se guardan en `localStorage` de cada dispositivo. Dos vecinos no ven lo mismo entre sí. Para vender como servicio hace falta un backend.
- **El PIN del encargado está en el código** y sirve solo para la demo; no protege datos reales.
- **WhatsApp se abre con el mensaje prellenado**; el envío automático requiere la API de WhatsApp Business o un bot.
- La “conciliación asistida” es un lector por reglas (no usa un modelo de IA externo) y siempre pide confirmación del encargado.
- Los datos de las 20 familias, los gastos, el horario de basura y del camión de agua son **ficticios o de ejemplo**.
- La ubicación del mapa es referencial: ajusta `lat`/`lng` en `data.js`.

## Hoja de ruta sugerida

1. **Backend y cuentas** (Supabase o Firebase): varios condominios, login de vecinos y encargado, datos compartidos en tiempo real.
2. **WhatsApp Business API / Telegram:** recordatorios de cobro, avisos y bot de preguntas frecuentes automáticos.
3. **Pagos:** conciliación con pago móvil/transferencia y recibos con numeración correlativa; revisar requisitos fiscales y legales locales.
4. **Control de acceso:** app de garita con lector de QR y rondines.
5. **Panel del vendedor:** alta de nuevos condominios en minutos y cobro de suscripción.

## Qué usan otros condominios (investigación)

Revisé plataformas que se usan hoy en condominios y comunidades. Lo que se repite es el mismo núcleo: **cobro y transparencia, tickets de mantenimiento, reservas de áreas, comunicación, votaciones y control de visitas con QR**, que es lo que cubre esta propuesta.

- **Soft-IA (Venezuela):** software de administración de condominios con recibos configurables, contabilidad, cobranza con recordatorios por correo y WhatsApp, y pagos en divisas, bolívares y criptomonedas. Se presenta como certificado por el SENIAT y con más de 1000 clientes en el país. Es el competidor local más directo. [soft-ia.com](https://soft-ia.com/home/software)
- **ComunidadFeliz (Chile, México, Colombia):** administra gastos comunes, registra pagos, reserva de salones y asadores, recepción de paquetes y muro de comunidad. La empresa asegura que reduce la morosidad alrededor de 30 %. [El Universal](https://www.eluniversal.com.mx/cartera/crean-app-que-permite-administrar-con-claridad-condominios/) · [Descubre.vc](https://www.descubre.vc/comunidadfeliz)
- **AdminCondo, AdminProp, Residentia, Cassandra (México y Latinoamérica):** QR temporales para visitantes, quejas convertidas en tickets, reservas de amenidades, conciliación de pagos, app para guardias y asistentes de IA para administración y residentes. [AdminCondo](https://www.comparasoftware.com/admincondo) · [AdminProp](https://www.comparasoftware.com/adminprop) · [Residentia](https://www.comparasoftware.com/residentia) · [Cassandra](https://mwm.ai/apps/casandra/1415558500)
- **Condo Control, PayHOA, Buildium, HOA Central (EE. UU.):** portal de residentes, solicitudes de mantenimiento, reserva de amenidades, votación electrónica, documentos y visitantes. [Capterra: HOA Central](https://www.capterra.com/p/10029832/HOA-Central/reviews/) · [Comparativa 2026](https://www.citybiz.co/article/837080/best-hoa-management-software-of-2026/)
- **Evidencia local:** un estudio de la Universidad José Antonio Páez (San Diego, Carabobo) sobre un condominio detectó fallas en el fondo de reserva, la emisión de recibos, el historial de operaciones y la votación, justo lo que atacan estos módulos. [UJAP](https://lapasiondelsaber.ujap.edu.ve/index.php/lapasiondelsaber-ojs/article/download/83/82/384)

### Cómo diferenciarse al venderlo

- **Hecho para la realidad venezolana:** cuota en USD con referencia en bolívares, pago móvil y WhatsApp como canal principal.
- **Compromiso de 24 horas medible:** el contador y la alerta de ticket vencido son una promesa visible para el vecino y una herramienta de control para la junta.
- **Transparencia que baja conflictos:** “cuentas claras” y votaciones digitales sin exponer datos de cada familia.
- **Precio accesible para condominios pequeños** (quintas, conjuntos de 20 a 100 viviendas), donde los sistemas grandes no llegan. Valida el precio con 3 a 5 condominios piloto antes de fijarlo.

---
© 2026 Orden y Gestión Urbana · Nexus Marketing
