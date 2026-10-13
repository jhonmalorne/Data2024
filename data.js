/* ============================================================
   Orden y Gestión Urbana · Configuración y datos de demostración
   Edita este archivo para adaptar el sistema a otro condominio.
   ============================================================ */

const RAW = "?raw=true";
const GH = "https://github.com/jhonmalorne/OrdenyGestionUrbana/blob/main/";

window.OGU_CONFIG = {
  app: { name: "Orden y Gestión Urbana", slogan: "Por una convivencia sana", version: "1.0.0" },

  condo: {
    name: "Quintas 2000",
    address: "Buenaventura, manzana 10, municipio Los Guayos, estado Carabobo",
    lat: 10.1868, lng: -67.9361,          // ubicación referencial: ajustar a la real
    fee: 25,                               // cuota mensual de condominio (USD)
    currency: "USD",
    reserveInitial: 300,                   // fondo de reserva inicial (USD)
    units: 20
  },

  contacts: {
    central:   "04144525765",
    email:     "jhoncuenta2@gmail.com",
    denuncias: "04244525765",
    vigilante: "04244525765",
    jardinero: "04244525765"
  },

  adminPin: "2000",     // SOLO DEMO. En producción usar autenticación real en servidor.
  slaHours: 24,         // tiempo máximo de respuesta a tickets

  assets: {
    logoOGU:   GH + "Orden%20y%20gestion%20Urbana.png" + RAW,
    logoConc:  GH + "Logo%20de%20concertacion.png" + RAW,
    banner:    GH + "Imagen%20superior.jpg" + RAW,
    qrPagos:   GH + "QR%20para%20pagos.png" + RAW,
    iconFb:    GH + "icono%20de%20facebook.jpg" + RAW,
    iconIg:    GH + "icono%20de%20instagram.jpg" + RAW,
    iconWa:    GH + "icono%20de%20whatsaap.jpg" + RAW,
    iconTt:    GH + "icono%20tiktok.png" + RAW,
    geoADM1:   "https://raw.githubusercontent.com/jhonmalorne/OrdenyGestionUrbana/main/geoBoundaries-VEN-ADM1_simplified.geojson",
    geoADM2:   "https://raw.githubusercontent.com/jhonmalorne/OrdenyGestionUrbana/main/geoBoundaries-VEN-ADM2_simplified.geojson"
  },

  social: {
    facebook:  "https://www.facebook.com/profile.php?id=61586104414801",
    instagram: "https://www.instagram.com/nexusmarketingnet/",
    tiktok:    "https://www.tiktok.com/@nexusmarketingnet/",
    whatsapp:  "https://jhonmalorne.github.io/nexus.net/"
  }
};

window.OGU_SEED = {
  /* 20 familias ficticias (demo). Andrez Tapisquent es el ejemplo de reserva solicitado. */
  families: [
    { id: 1,  name: "Andrez Tapisquent",   piso: 1 },
    { id: 2,  name: "María Fernández",     piso: 2 },
    { id: 3,  name: "Carlos Rondón",       piso: 1 },
    { id: 4,  name: "Luisa Pérez",         piso: 2 },
    { id: 5,  name: "José Gregorio Mora",  piso: 1 },
    { id: 6,  name: "Yelitza Colmenares",  piso: 2 },
    { id: 7,  name: "Pedro Ledezma",       piso: 1 },
    { id: 8,  name: "Andreína Soto",       piso: 2 },
    { id: 9,  name: "Rafael Briceño",      piso: 1 },
    { id: 10, name: "Carolina Villegas",   piso: 2 },
    { id: 11, name: "Luis Alberto Páez",   piso: 1 },
    { id: 12, name: "Norma Camacho",       piso: 2 },
    { id: 13, name: "Eduardo Salazar",     piso: 1 },
    { id: 14, name: "Gabriela Linares",    piso: 2 },
    { id: 15, name: "Héctor Mendoza",      piso: 1 },
    { id: 16, name: "Yuleidy Torrealba",   piso: 2 },
    { id: 17, name: "Franklin Ochoa",      piso: 1 },
    { id: 18, name: "Mirian Delgado",      piso: 2 },
    { id: 19, name: "Oswaldo Reyes",       piso: 1 },
    { id: 20, name: "Dayana Quintero",     piso: 2 }
  ],

  // Meses de atraso por familia (0 = mes actual, 1 = mes anterior, ...)
  seedDebt: { 6: [1, 2], 11: [1], 15: [1, 2, 3], 19: [1] },
  // Familias que ya pagaron el mes actual
  seedPaidCurrent: [1, 2, 3, 4, 5, 8, 9, 13, 16],

  areas: {
    salon:    { name: "Salón de fiestas", icon: "🎉", deposit: 30, hours: "9:00 am – 10:00 pm" },
    churuata: { name: "Churuata",         icon: "🛖", deposit: 20, hours: "9:00 am – 10:00 pm" },
    cancha:   { name: "Cancha deportiva", icon: "⚽", deposit: 0,  hours: "6:00 am – 9:00 pm" }
  },

  ticketCategories: ["Alumbrado", "Filtración / agua", "Portón / acceso", "Áreas verdes", "Seguridad", "Limpieza / basura", "Convivencia / ruido", "Otro"],
  assignees: ["Encargado", "Conserje / vigilante", "Jardinero", "Proveedor externo"],

  expenseCategories: ["Vigilancia", "Jardinería", "Electricidad áreas comunes", "Limpieza", "Agua (cisterna)", "Reparaciones", "Administración", "Otro"],

  rules: [
    { t: "Horario de silencio", d: "De 10:00 pm a 6:00 am no se permiten ruidos molestos ni música a volumen alto. Las fiestas autorizadas en áreas comunes terminan a las 10:00 pm." },
    { t: "Áreas comunes y reservas", d: "Salón, churuata y cancha se reservan con la central de atención. La reserva queda visible en el calendario para todos los vecinos. Se entrega el área limpia y en las mismas condiciones." },
    { t: "Mascotas", d: "Los dueños son responsables de recoger los desechos de sus mascotas y de mantenerlas con correa en áreas comunes." },
    { t: "Basura y reciclaje", d: "Los desechos se sacan solo los días de recolección, en bolsas cerradas y en el punto indicado. No se deja basura en pasillos ni áreas verdes." },
    { t: "Estacionamiento y vehículos", d: "Cada vivienda usa su puesto asignado. No se bloquean accesos, portón ni áreas de emergencia. Velocidad máxima dentro del condominio: 10 km/h." },
    { t: "Pago de condominio", d: "La cuota se paga dentro de los primeros 5 días de cada mes. El estado de cuenta de cada vivienda es privado; los reportes públicos muestran solo totales." },
    { t: "Convivencia y denuncias", d: "Ante conflictos, primero el diálogo. Si persiste, se reporta a la línea de denuncias del condominio. Todo reporte se atiende con reserva." }
  ],

  schedules: {
    cancha: "La cancha funciona de 6:00 am a 9:00 pm.",
    salon: "El salón de fiestas se reserva de 9:00 am a 10:00 pm.",
    churuata: "La churuata se reserva de 9:00 am a 10:00 pm.",
    agua: "El camión cisterna pasa martes y sábado en la mañana (horario de ejemplo, ajústalo en data.js).",
    basura: "La recolección de basura es lunes, miércoles y viernes (horario de ejemplo, ajústalo en data.js).",
    silencio: "El horario de silencio es de 10:00 pm a 6:00 am."
  }
};
