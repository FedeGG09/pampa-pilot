// Mock data for AgroCopilot AI — Argentine agriculture context

export const kpis = [
  { label: "Rinde Promedio", value: "42", unit: "qq/ha", delta: "+5.2%", positive: true },
  { label: "Estado de Cosecha", value: "65", unit: "%", delta: "Campaña 2026", positive: true },
  { label: "Margen Bruto", value: "320", unit: "USD/ha", delta: "+12 USD", positive: true },
  { label: "Alerta Maquinaria", value: "1", unit: "unidad", delta: "En riesgo", positive: false },
];

export const margenChart = [
  { mes: "Sep", margen: 180, proyeccion: 200 },
  { mes: "Oct", margen: 210, proyeccion: 230 },
  { mes: "Nov", margen: 245, proyeccion: 260 },
  { mes: "Dic", margen: 270, proyeccion: 285 },
  { mes: "Ene", margen: 290, proyeccion: 305 },
  { mes: "Feb", margen: 305, proyeccion: 320 },
  { mes: "Mar", margen: 320, proyeccion: 335 },
  { mes: "Abr", margen: 335, proyeccion: 350 },
];

export const pizarraRosario = [
  { producto: "Soja", precio: 312, unidad: "USD/t", delta: "+1.8%", positive: true },
  { producto: "Maíz", precio: 198, unidad: "USD/t", delta: "-0.4%", positive: false },
  { producto: "Trigo", precio: 245, unidad: "USD/t", delta: "+0.9%", positive: true },
  { producto: "Girasol", precio: 425, unidad: "USD/t", delta: "+2.1%", positive: true },
];

export const clima = {
  ubicacion: "Pergamino, Bs. As.",
  temp: 24,
  condicion: "Parcialmente nublado",
  humedad: 68,
  viento: 14,
  pronostico: "Niña moderada",
};

export type Lote = {
  id: string;
  nombre: string;
  hectareas: number;
  cultivo: string;
  rinde: number;
  ph: number;
  nitrogeno: "Bajo" | "Medio" | "Alto";
  fosforo: "Bajo" | "Medio" | "Alto";
  ndvi: number;
  humedad: number;
  recomendacion: string;
  historial: string[];
  // SVG polygon points for the visual map
  points: string;
  color: string;
};

export const lotes: Lote[] = [
  {
    id: "ombu",
    nombre: "El Ombú",
    hectareas: 145,
    cultivo: "Soja 1ª",
    rinde: 45,
    ph: 6.3,
    nitrogeno: "Alto",
    fosforo: "Medio",
    ndvi: 0.78,
    humedad: 62,
    recomendacion: "Condiciones Niña detectadas → Recomendado: Soja ciclo corto DM 40R16",
    historial: ["2024: Maíz", "2023: Soja", "2022: Trigo/Soja 2ª"],
    points: "60,80 220,60 260,180 180,240 80,200",
    color: "var(--accent-lime)",
  },
  {
    id: "juanita",
    nombre: "La Juanita",
    hectareas: 98,
    cultivo: "Maíz tardío",
    rinde: 88,
    ph: 6.1,
    nitrogeno: "Medio",
    fosforo: "Alto",
    ndvi: 0.71,
    humedad: 55,
    recomendacion: "Ventana óptima de siembra: 15-30 Dic. Densidad sugerida 72.000 pl/ha",
    historial: ["2024: Soja", "2023: Maíz", "2022: Soja"],
    points: "300,90 460,70 480,210 360,260 290,180",
    color: "var(--accent-green)",
  },
  {
    id: "esperanza",
    nombre: "La Esperanza",
    hectareas: 220,
    cultivo: "Trigo",
    rinde: 38,
    ph: 5.8,
    nitrogeno: "Bajo",
    fosforo: "Medio",
    ndvi: 0.55,
    humedad: 41,
    recomendacion: "Déficit hídrico → Aplicar fertilización nitrogenada 80 kg/ha urea",
    historial: ["2024: Trigo/Soja", "2023: Maíz", "2022: Trigo"],
    points: "520,100 700,80 740,240 600,290 510,220",
    color: "var(--status-warning)",
  },
  {
    id: "don-pedro",
    nombre: "Don Pedro",
    hectareas: 175,
    cultivo: "Girasol",
    rinde: 28,
    ph: 6.5,
    nitrogeno: "Alto",
    fosforo: "Alto",
    ndvi: 0.82,
    humedad: 70,
    recomendacion: "Condiciones óptimas. Monitorear plaga de orugas defoliadoras.",
    historial: ["2024: Girasol", "2023: Soja", "2022: Maíz"],
    points: "120,300 290,290 320,420 200,470 90,400",
    color: "var(--accent-green)",
  },
  {
    id: "san-jose",
    nombre: "San José",
    hectareas: 132,
    cultivo: "Soja 2ª",
    rinde: 32,
    ph: 6.0,
    nitrogeno: "Medio",
    fosforo: "Bajo",
    ndvi: 0.66,
    humedad: 58,
    recomendacion: "Refuerzo de fósforo en línea de siembra. Inoculación recomendada.",
    historial: ["2024: Trigo/Soja 2ª", "2023: Maíz", "2022: Soja"],
    points: "380,310 540,300 560,440 420,470 360,390",
    color: "var(--accent-lime)",
  },
];

export type Semilla = {
  id: string;
  marca: "NK" | "Don Mario" | "Pioneer" | "Brevant";
  variedad: string;
  cultivo: "Soja" | "Maíz" | "Trigo";
  ciclo: "Corto" | "Intermedio" | "Largo";
  resistencia: string[];
  scoreIA: number;
  badge?: string;
};

export const semillas: Semilla[] = [
  {
    id: "dm40r16",
    marca: "Don Mario",
    variedad: "DM 40R16",
    cultivo: "Soja",
    ciclo: "Corto",
    resistencia: ["Roya", "Mancha ojo de rana"],
    scoreIA: 94,
    badge: "Recomendado IA",
  },
  {
    id: "nk-3939",
    marca: "NK",
    variedad: "NK 3939 VIPTERA3",
    cultivo: "Maíz",
    ciclo: "Intermedio",
    resistencia: ["Cogollero", "Diatraea"],
    scoreIA: 89,
  },
  {
    id: "p1815",
    marca: "Pioneer",
    variedad: "P1815 VYHR",
    cultivo: "Maíz",
    ciclo: "Largo",
    resistencia: ["Roya común", "Tizón"],
    scoreIA: 87,
  },
  {
    id: "dm46i17",
    marca: "Don Mario",
    variedad: "DM 46i17",
    cultivo: "Soja",
    ciclo: "Intermedio",
    resistencia: ["Cancro del tallo", "Phytophthora"],
    scoreIA: 85,
  },
  {
    id: "brevant-bx",
    marca: "Brevant",
    variedad: "BX 8718",
    cultivo: "Trigo",
    ciclo: "Largo",
    resistencia: ["Roya amarilla", "Fusariosis"],
    scoreIA: 82,
  },
  {
    id: "nk-soja",
    marca: "NK",
    variedad: "NK 5009",
    cultivo: "Soja",
    ciclo: "Corto",
    resistencia: ["Mancha marrón"],
    scoreIA: 79,
  },
];

export type Maquina = {
  id: string;
  marca: string;
  modelo: string;
  tipo: "Cosechadora" | "Tractor" | "Pulverizadora" | "Sembradora";
  health: number;
  horas: number;
  ubicacion: string;
  alerta?: string;
};

export const flota: Maquina[] = [
  {
    id: "jd-s780",
    marca: "John Deere",
    modelo: "S780",
    tipo: "Cosechadora",
    health: 42,
    horas: 4820,
    ubicacion: "Lote El Ombú",
    alerta: "Presión hidráulica baja — Error 404",
  },
  {
    id: "case-puma",
    marca: "Case IH",
    modelo: "Puma 215",
    tipo: "Tractor",
    health: 88,
    horas: 2340,
    ubicacion: "Galpón central",
  },
  {
    id: "pla-3000",
    marca: "PLA",
    modelo: "MAP 3 II",
    tipo: "Pulverizadora",
    health: 76,
    horas: 1890,
    ubicacion: "Lote La Juanita",
  },
  {
    id: "agro-sembr",
    marca: "Agrometal",
    modelo: "MXY 9070",
    tipo: "Sembradora",
    health: 91,
    horas: 1120,
    ubicacion: "Galpón central",
  },
];

export const macroNoticias = [
  {
    fuente: "BCR",
    titulo: "Pizarra Rosario: la soja cierra en alza por demanda china",
    resumen: "El poroto de soja sumó USD 5,5 en la rueda del jueves. El maíz cerró estable.",
    tiempo: "hace 12 min",
    tag: "Mercados",
  },
  {
    fuente: "BCR",
    titulo: "Estimación de cosecha 2025/26: 52 Mt de soja",
    resumen: "La GEA proyecta una de las mejores campañas si se confirma la transición ENSO.",
    tiempo: "hace 1 h",
    tag: "Estimaciones",
  },
  {
    fuente: "Min. Economía",
    titulo: "Sin cambios en derechos de exportación al complejo sojero",
    resumen: "Soja 33%, harina y aceite 31%. Maíz y trigo se mantienen en 12%.",
    tiempo: "hace 3 h",
    tag: "Retenciones",
  },
];
