/**
 * Role-based tool access configuration for GSD Outsources.
 *
 * TOOLS available:
 *   google_workspace  — Google Workspace account @gsdoutsources.com (TODOS)
 *   google_voice      — Google Voice number (operaciones, ventas, soporte)
 *   slack             — Acceso a Slack workspace
 *   timedoctor        — Time Doctor para tracking de tiempo
 *   hubspot           — HubSpot CRM
 *   github            — GitHub (solo perfiles técnicos)
 *
 * Estructura: cada entrada define las herramientas por defecto para ese perfil.
 * HR puede anular cualquier selección desde el modal de onboarding.
 */

// Herramientas base que TODOS los empleados reciben
export const BASE_TOOLS = ['google_workspace'];

// Mapa de departamento → herramientas adicionales por defecto
export const DEPARTMENT_TOOLS = {
  engineering:  ['slack', 'timedoctor', 'github'],
  design:       ['slack', 'timedoctor'],
  marketing:    ['slack', 'timedoctor', 'hubspot'],
  sales:        ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  hr:           ['slack', 'timedoctor', 'hubspot'],
  finance:      ['slack', 'timedoctor'],
  operations:   ['slack', 'timedoctor', 'google_voice'],
  support:      ['slack', 'timedoctor', 'google_voice', 'hubspot'],
  management:   ['slack', 'timedoctor', 'hubspot', 'google_voice'],
};

// Perfiles / rangos con herramientas especiales que sobreescriben el departamento
export const ROLE_OVERRIDES = {
  // Directivos y C-level → todo
  'ceo':                ['slack', 'timedoctor', 'hubspot', 'google_voice', 'github'],
  'cto':                ['slack', 'timedoctor', 'hubspot', 'google_voice', 'github'],
  'coo':                ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'director':           ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'gerente':            ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'manager':            ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  // Técnicos
  'developer':          ['slack', 'timedoctor', 'github'],
  'engineer':           ['slack', 'timedoctor', 'github'],
  'devops':             ['slack', 'timedoctor', 'github'],
  'qa':                 ['slack', 'timedoctor', 'github'],
  // Comerciales
  'sales rep':          ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'account executive':  ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'account manager':    ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'business dev':       ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  // Soporte / Ops
  'customer success':   ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'support':            ['slack', 'timedoctor', 'hubspot', 'google_voice'],
  'coordinator':        ['slack', 'timedoctor'],
  'analyst':            ['slack', 'timedoctor'],
  // Diseño / Marketing
  'designer':           ['slack', 'timedoctor'],
  'copywriter':         ['slack', 'timedoctor'],
  'seo':                ['slack', 'timedoctor', 'hubspot'],
};

/**
 * Calcula las herramientas por defecto para un empleado dado su departamento y cargo.
 * Combina BASE_TOOLS + departamento + overrides de rol (sin duplicados).
 *
 * @param {string|null} department - e.g. 'engineering'
 * @param {string|null} roleTitle  - e.g. 'Sales Rep'
 * @returns {string[]} array of tool keys
 */
export function getDefaultTools(department, roleTitle) {
  const tools = new Set(BASE_TOOLS);

  // Añadir herramientas del departamento
  const deptKey = department?.toLowerCase().trim();
  const deptTools = DEPARTMENT_TOOLS[deptKey] ?? [];
  deptTools.forEach((t) => tools.add(t));

  // Buscar override por rol (match parcial, case-insensitive)
  if (roleTitle) {
    const roleLower = roleTitle.toLowerCase();
    for (const [key, roleTools] of Object.entries(ROLE_OVERRIDES)) {
      if (roleLower.includes(key)) {
        roleTools.forEach((t) => tools.add(t));
        break;
      }
    }
  }

  return [...tools];
}

// Metadata de cada herramienta para mostrar en el modal
export const TOOL_META = {
  google_workspace: {
    label: 'Google Workspace (@gsdoutsources.com)',
    emoji: 'google',
    description: 'Cuenta de correo y suite de productividad',
    required: true,
  },
  google_voice: {
    label: 'Google Voice',
    emoji: 'phone',
    description: 'Número de teléfono virtual para llamadas',
    required: false,
  },
  slack: {
    label: 'Slack',
    emoji: 'slack',
    description: 'Mensajería y colaboración del equipo',
    required: false,
  },
  timedoctor: {
    label: 'Time Doctor',
    emoji: 'clock3',
    description: 'Seguimiento de tiempo y productividad',
    required: false,
  },
  hubspot: {
    label: 'HubSpot',
    emoji: 'chart_with_upwards_trend',
    description: 'CRM y automatización de marketing/ventas',
    required: false,
  },
  github: {
    label: 'GitHub',
    emoji: 'octocat',
    description: 'Repositorios de código',
    required: false,
  },
};

// Todas las herramientas disponibles
export const ALL_TOOLS = Object.keys(TOOL_META);
