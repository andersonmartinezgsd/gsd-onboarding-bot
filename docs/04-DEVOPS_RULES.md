# 🤖 AMROSAI DevOps & Git Rules
## Políticas y Procedimientos de Desarrollo

---

## 1. FLUJO DE TRABAJO (Git Workflow)

### Rama Principal (Protegida)
- **main**: Producción estable - Solo merge desde staging
- **staging**: Pruebas/Aprobaciones - Merge desde dev
- **dev**: Desarrollo activo - Rama por defecto

### Reglas de Protección
```
main    → Solo accessible desde production
staging → Pruebas pre-producción  
dev     → Desarrollo diario
```

---

## 2. POLÍTICA DE COMMITS

### Formato Obligatorio
```
<tipo>(<área>): <descripción>

Tipos:
- feat:     Nueva funcionalidad
- fix:      Corrección de bug
- refactor: Refactorización
- docs:     Documentación
- test:     Tests
- chore:    Mantenimiento

Ejemplos:
feat(agents): Agregar nuevo agente de nivel master
fix(load_balancer): Corregir saturación de agentes
docs(api): Actualizar documentación de endpoints
```

### Reglas
- ✅ Mensajes en español o inglés
- ✅ Máximo 72 caracteres en título
- ✅ Descripción detallada en body
- ✅ Referenciar issues si existen

---

## 3. PROCEDIMIENTO DE DESARROLLO

### Paso 1: Crear Rama de Trabajo
```bash
# Nueva funcionalidad
git checkout -b feat/nombre-caracteristica

# Corrección
git checkout -b fix/descripcion-problema

# Hotfix producción
git checkout -b hotfix/descripcion-urgente
```

### Paso 2: Desarrollo
```bash
# Trabajar en la rama
git add .
git commit -m "feat(area): descripción"
git push origin feat/nombre-caracteristica
```

### Paso 3: Pull Request
1. Crear PR a `dev`
2. Esperar aprobación
3. Ejecutar tests
4. Merge a dev

### Paso 4: Promoción a Producción
```
dev → staging (pruebas) → main (producción)
```

---

## 4. AGENTES DEL SISTEMA

### Agentes Activos

| Agente | Función | Activación |
|--------|---------|------------|
| @PROJECT_MANAGER | Asigna tareas, prioriza | `¿Qué tareas hay?` |
| @DEV | Desarrollo código | `Desarrolla [功能]` |
| @GIT | Control de versiones | `git [comando]` |
| @TEST | Ejecución pruebas | `Ejecuta tests` |
| @DEPLOY | Despliegue | `Despliega a [ambiente]` |
| @MONITOR | Supervisión | `Estado del sistema` |
| @SECURITY | Auditoría | `Audita seguridad` |
| @BACKUP | Respaldo | `Respaldar [área]` |

### Activación de Agentes
```bash
# Siempre iniciar con @GIT para comandos Git
@GIT crear rama feat/nueva-caracteristica

# Para desarrollo
@DEV implementar agente de autenticación

# Para despliegue
@DEPLOY environment=production

# Para monitoreo
@MONITOR status
```

---

## 5. CONFIGURACIÓN DE AMBIENTES

### Puertos Asignados
```
dev         → http://127.0.0.1:42024
staging     → http://127.0.0.1:43034
production  → http://127.0.0.1:41014
```

### Regla Obligatoria: DB asociada a rama
```
MAIN    -> data/AMROSAI.db
STAGING -> data/SAMROSAI.db
DEV     -> data/DAMROSAI.db
```

### Variables de Entorno
```bash
# MAIN / Production
ENVIRONMENT=main
DATABASE_URL=sqlite:///./data/AMROSAI.db

# STAGING
ENVIRONMENT=staging
DATABASE_URL=sqlite:///./data/SAMROSAI.db

# DEV
ENVIRONMENT=dev
DATABASE_URL=sqlite:///./data/DAMROSAI.db
```

**Importante:** `Settings` normaliza `main -> production`, por lo tanto `main` y `production`
usan la misma DB canónica `AMROSAI.db`.

---

## 6. POLÍTICA DE VERSIONAMIENTO

### SemVer (Semantic Versioning)
```
MAJOR.MINOR.PATCH
1.0.0 → 1.1.0 → 1.1.1

- MAJOR: Cambios incompatibles
- MINOR: Nuevas funcionalidades compatibles
- PATCH: Correcciones compatibles
```

### Ramas de Versión
```
v1.0.x → Desarrollo rápido
v1.x.0 → Nuevas funcionalidades  
v2.0.0 → Cambios mayores
```

---

## 7. POLÍTICA DE SEGURIDAD

### Ramas Protegidas (GitHub)
- [ ] Require PR reviews
- [ ] Require status checks
- [ ] Require signed commits
- [ ] Block force push

### Credenciales
- ❌ Nunca commitear secrets
- ✅ Usar variables de entorno
- ✅ Usar GitHub Secrets

---

## 8. PROCEDIMIENTO DE EMERGENCIA

### Hotfix en Producción
```bash
# 1. Crear rama desde main
git checkout -b hotfix/descripcion

# 2. Corregir
git commit -m "fix(production): corrección urgente"

# 3. PR directo a main (sin staging)
# 4. Deploy inmediato
# 5. Merge main → dev → staging
```

---

## 9. AGENDA DE TAREAS AUTOMÁTICAS

| Hora | Tarea | Script |
|------|-------|--------|
| Cada hora | Task Guardian | `task_guardian.py` |
| Cada 5 min | Load Balancer | `load_balancer.py` |
| 2:00 AM | Autoaprendizaje | `nightly_self_learning.py` |
| 2:30 AM | Training | `training_manager.py` |
| Daily | Backup | `backup.sh` |

---

## 10. NOTIFICACIONES

### Reportes por Email
- **andersonmares81@gmail.com**: Tareas sin resolver, reentrenamientos

### Slack/Teams (futuro)
- #devops: Deploys
- #alerts: Errores críticos

---

## RESUMEN RÁPIDO

```
✅ Commits con formato
✅ Ramas desde dev
✅ PRs para merging
✅ Tests antes de merge
✅ main protegida

🔧 PUERTOS:
   dev: 41014
   staging: 41015  
   production: 41016

📋 FLUJO:
   dev → staging → main
```

---

*Documento vivo - Actualizar según necesidades del proyecto*
*Versión: 1.0.0 | Rama: dev | Fecha: 2026-02-14*
