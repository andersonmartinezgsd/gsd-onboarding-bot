# REPORTE DETALLADO DE 87 AGENTES (TIEMPO REAL) - DEV

## 1. Metadata
- Fecha de generacion: 2026-02-23 14:09:56 UTC
- Fuente de datos: `data/amrosai_dev.db`
- Objetivo: evidenciar actividad de cada agente y cumplimiento de request actual

## 2. Resumen del sistema
- Total agentes: 87
- Agentes activos: 1
- Agentes ocupados: 0
- Agentes inactivos: 86
- Filas en `agent_learning`: 88
- Filas en `agent_iq_events`: 88
- Filas en `agent_iq_snapshots`: 87
- Filas en `nightly_evaluations`: 88
- Filas en `tasks`: 0
- Filas en `agent_usage`: 0

## 3. Criterio de cumplimiento solicitado
- `Cumplimiento request actual`:
  - `N/A` cuando no existe evidencia de ejecucion operativa en tiempo real para esta solicitud (sin registros en `tasks` y `agent_usage`).
  - `OK` solo si hay evidencia directa de ejecucion operativa del agente para la solicitud actual.

## 4. Detalle por agente

| # | Agent ID | Agente | Rol | Depto | Estado | Nivel | XP | Tareas Aprendizaje | Errores Corregidos | Soluciones | IQ | Eventos IQ | Ultimo Evento | Tasks DB | Usage DB | Cumplimiento request actual |
|---|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---|---:|---:|---|
| 1 | MID-BACKEND-001 | Backend Engineer | Backend Engineer | Engineering | inactive | senior | 615 | 7 | 7 | 4 | 116.28 | 1 | 2026-02-23T13:04:04.962780 | 0 | 0 | N/A |
| 2 | MID-BUSINESS-ANALYST-001 | Business Analyst | Business Analyst | Business | inactive | senior | 540 | 7 | 4 | 4 | 113.10 | 1 | 2026-02-23T13:04:05.870054 | 0 | 0 | N/A |
| 3 | JR-BUSINESS-ANALYST-001 | Business Analyst | Business Analyst | Business | inactive | senior | 525 | 6 | 5 | 3 | 112.12 | 1 | 2026-02-23T13:04:07.549569 | 0 | 0 | N/A |
| 4 | CEO-001 | Chief Executive Officer | Chief Executive Officer | Executive | active | senior | 1205 | 18 | 7 | 5 | 127.08 | 2 | 2026-02-23T13:04:19.362438 | 0 | 0 | N/A |
| 5 | CFO-001 | Chief Financial Officer | Chief Financial Officer | Executive | inactive | senior | 850 | 11 | 6 | 3 | 117.98 | 1 | 2026-02-23T13:04:03.430459 | 0 | 0 | N/A |
| 6 | CISO-001 | Chief Information Security Officer | Chief Information Security Officer | Executive | inactive | senior | 660 | 7 | 6 | 3 | 113.65 | 1 | 2026-02-23T13:04:03.487173 | 0 | 0 | N/A |
| 7 | COO-001 | Chief Operating Officer | Chief Operating Officer | Executive | inactive | senior | 610 | 8 | 6 | 6 | 116.88 | 1 | 2026-02-23T13:04:03.454311 | 0 | 0 | N/A |
| 8 | CTO-001 | Chief Technology Officer | Chief Technology Officer | Executive | inactive | senior | 985 | 11 | 7 | 5 | 123.12 | 1 | 2026-02-23T13:04:03.398222 | 0 | 0 | N/A |
| 9 | MID-CLOUD-001 | Cloud Engineer | Cloud Engineer | Engineering | inactive | senior | 605 | 8 | 5 | 5 | 116.19 | 1 | 2026-02-23T13:04:05.526933 | 0 | 0 | N/A |
| 10 | JR-COMMUNICATIONS-001 | Communications Coordinator | Communications Coordinator | Communications | inactive | mid_level | 445 | 3 | 3 | 3 | 106.61 | 1 | 2026-02-23T13:04:08.020795 | 0 | 0 | N/A |
| 11 | JR-COMPLIANCE-001 | Compliance Analyst | Compliance Analyst | Legal | inactive | senior | 510 | 4 | 4 | 4 | 110.90 | 1 | 2026-02-23T13:04:07.165032 | 0 | 0 | N/A |
| 12 | JR-CONTENT-MANAGER-001 | Content Manager | Content Manager | Marketing | inactive | mid_level | 415 | 3 | 3 | 2 | 106.51 | 1 | 2026-02-23T13:04:07.963748 | 0 | 0 | N/A |
| 13 | JR-CONTENT-WRITER-001 | Content Writer | Content Writer | Marketing | inactive | senior | 690 | 9 | 8 | 5 | 120.10 | 1 | 2026-02-23T13:04:06.394698 | 0 | 0 | N/A |
| 14 | JR-CUSTOMER-SUCCESS-001 | Customer Success Associate | Customer Success Associate | Customer Success | inactive | senior | 505 | 6 | 3 | 4 | 110.11 | 1 | 2026-02-23T13:04:07.034410 | 0 | 0 | N/A |
| 15 | MID-DATA-ANALYST-001 | Data Analyst | Data Analyst | Data | inactive | senior | 730 | 13 | 8 | 5 | 123.03 | 1 | 2026-02-23T13:04:05.982885 | 0 | 0 | N/A |
| 16 | MID-DATA-ENG-001 | Data Engineer | Data Engineer | Data | inactive | senior | 565 | 7 | 5 | 4 | 114.16 | 1 | 2026-02-23T13:04:05.359602 | 0 | 0 | N/A |
| 17 | JR-DATA-ENTRY-001 | Data Entry Specialist | Data Entry Specialist | Data | inactive | mid_level | 450 | 4 | 4 | 2 | 108.30 | 1 | 2026-02-23T13:04:06.977604 | 0 | 0 | N/A |
| 18 | MID-DATABASE-001 | Database Administrator | Database Administrator | Data | inactive | senior | 645 | 12 | 5 | 5 | 119.12 | 1 | 2026-02-23T13:04:05.633676 | 0 | 0 | N/A |
| 19 | MID-DEVOPS-001 | DevOps Engineer | DevOps Engineer | Engineering | inactive | senior | 695 | 10 | 9 | 4 | 120.59 | 1 | 2026-02-23T13:04:05.132960 | 0 | 0 | N/A |
| 20 | MID-MARKETING-001 | Digital Marketing Specialist | Digital Marketing Specialist | Marketing | inactive | senior | 705 | 11 | 7 | 4 | 119.67 | 1 | 2026-02-23T13:04:06.027599 | 0 | 0 | N/A |
| 21 | DIR-ARCH-001 | Director of Architecture | Director of Architecture | Engineering | inactive | senior | 625 | 8 | 7 | 4 | 117.01 | 1 | 2026-02-23T13:04:03.732779 | 0 | 0 | N/A |
| 22 | DIR-DATA-001 | Director of Data Science | Director of Data Science | Data | inactive | senior | 660 | 11 | 6 | 5 | 119.45 | 1 | 2026-02-23T13:04:03.987961 | 0 | 0 | N/A |
| 23 | DIR-DEVOPS-001 | Director of DevOps | Director of DevOps | Engineering | inactive | senior | 640 | 7 | 6 | 4 | 115.68 | 1 | 2026-02-23T13:04:03.908425 | 0 | 0 | N/A |
| 24 | DIR-ENG-001 | Director of Engineering | Director of Engineering | Engineering | inactive | senior | 575 | 8 | 5 | 4 | 114.89 | 1 | 2026-02-23T13:04:03.640407 | 0 | 0 | N/A |
| 25 | DIR-PROD-001 | Director of Product Management | Director of Product Management | Product | inactive | senior | 570 | 10 | 4 | 4 | 115.30 | 1 | 2026-02-23T13:04:03.690183 | 0 | 0 | N/A |
| 26 | DIR-PMO-001 | Director of Project Management | Director of Project Management | Operations | inactive | senior | 605 | 11 | 5 | 4 | 117.09 | 1 | 2026-02-23T13:04:04.048596 | 0 | 0 | N/A |
| 27 | DIR-QA-001 | Director of Quality Assurance | Director of Quality Assurance | Engineering | inactive | senior | 580 | 9 | 6 | 3 | 115.38 | 1 | 2026-02-23T13:04:03.776034 | 0 | 0 | N/A |
| 28 | DIR-SEC-001 | Director of Security | Director of Security | Security | inactive | senior | 590 | 10 | 6 | 3 | 116.12 | 1 | 2026-02-23T13:04:03.846597 | 0 | 0 | N/A |
| 29 | JR-EMAIL-MARKETING-001 | Email Marketing Specialist | Email Marketing Specialist | Marketing | inactive | mid_level | 450 | 4 | 4 | 2 | 105.90 | 1 | 2026-02-23T13:04:07.901490 | 0 | 0 | N/A |
| 30 | JR-EVENTS-001 | Event Coordinator | Event Coordinator | Marketing | inactive | mid_level | 470 | 3 | 4 | 3 | 106.47 | 1 | 2026-02-23T13:04:08.089034 | 0 | 0 | N/A |
| 31 | JR-FINANCE-ANALYST-001 | Financial Analyst | Financial Analyst | Finance | inactive | mid_level | 470 | 3 | 4 | 3 | 106.47 | 1 | 2026-02-23T13:04:07.607202 | 0 | 0 | N/A |
| 32 | MID-FRONTEND-001 | Frontend Engineer | Frontend Engineer | Engineering | inactive | senior | 675 | 10 | 7 | 5 | 119.78 | 1 | 2026-02-23T13:04:05.021843 | 0 | 0 | N/A |
| 33 | MID-FULLSTACK-001 | Full Stack Engineer | Full Stack Engineer | Engineering | inactive | senior | 615 | 7 | 7 | 4 | 116.28 | 1 | 2026-02-23T13:04:05.077262 | 0 | 0 | N/A |
| 34 | JR-HR-001 | HR Coordinator | HR Coordinator | HR | inactive | senior | 540 | 5 | 6 | 3 | 112.45 | 1 | 2026-02-23T13:04:06.624228 | 0 | 0 | N/A |
| 35 | JR-IT-SUPPORT-001 | IT Support Technician | IT Support Technician | IT | inactive | senior | 620 | 6 | 6 | 2 | 112.82 | 1 | 2026-02-23T13:04:07.232815 | 0 | 0 | N/A |
| 36 | JR-BACKEND-001 | Junior Backend Developer | Junior Backend Developer | Engineering | inactive | senior | 620 | 10 | 6 | 4 | 117.42 | 1 | 2026-02-23T13:04:06.061096 | 0 | 0 | N/A |
| 37 | JR-DATA-ANALYST-001 | Junior Data Analyst | Junior Data Analyst | Data | inactive | senior | 605 | 9 | 7 | 3 | 115.24 | 1 | 2026-02-23T13:04:06.253680 | 0 | 0 | N/A |
| 38 | JR-DATA-SCIENCE-001 | Junior Data Scientist | Junior Data Scientist | Data | inactive | senior | 555 | 6 | 5 | 4 | 112.22 | 1 | 2026-02-23T13:04:07.715573 | 0 | 0 | N/A |
| 39 | JR-DEVOPS-001 | Junior DevOps Engineer | Junior DevOps Engineer | Engineering | inactive | senior | 665 | 9 | 7 | 5 | 119.04 | 1 | 2026-02-23T13:04:06.157635 | 0 | 0 | N/A |
| 40 | JR-FINANCE-001 | Junior Financial Analyst | Junior Financial Analyst | Finance | inactive | senior | 685 | 7 | 5 | 3 | 111.86 | 1 | 2026-02-23T13:04:06.689462 | 0 | 0 | N/A |
| 41 | JR-FRONTEND-001 | Junior Frontend Developer | Junior Frontend Developer | Engineering | inactive | senior | 605 | 9 | 7 | 3 | 116.44 | 1 | 2026-02-23T13:04:06.086580 | 0 | 0 | N/A |
| 42 | JR-FULLSTACK-001 | Junior Full Stack Developer | Junior Full Stack Developer | Engineering | inactive | senior | 640 | 9 | 6 | 5 | 117.98 | 1 | 2026-02-23T13:04:06.113206 | 0 | 0 | N/A |
| 43 | JR-QA-001 | Junior QA Engineer | Junior QA Engineer | Engineering | inactive | senior | 600 | 10 | 4 | 5 | 116.60 | 1 | 2026-02-23T13:04:06.135716 | 0 | 0 | N/A |
| 44 | JR-SEC-001 | Junior Security Analyst | Junior Security Analyst | Security | inactive | senior | 575 | 10 | 3 | 5 | 113.14 | 1 | 2026-02-23T13:04:06.202331 | 0 | 0 | N/A |
| 45 | JR-UI-DESIGNER-001 | Junior UI Designer | Junior UI Designer | Design | inactive | senior | 685 | 11 | 7 | 5 | 118.11 | 1 | 2026-02-23T13:04:06.320582 | 0 | 0 | N/A |
| 46 | JR-LEGAL-ASST-001 | Legal Assistant | Legal Assistant | Legal | inactive | mid_level | 485 | 4 | 3 | 4 | 108.64 | 1 | 2026-02-23T13:04:07.660785 | 0 | 0 | N/A |
| 47 | MID-ML-001 | Machine Learning Engineer | Machine Learning Engineer | Data | inactive | senior | 625 | 8 | 7 | 4 | 117.01 | 1 | 2026-02-23T13:04:05.417236 | 0 | 0 | N/A |
| 48 | JR-MARKETING-ANALYST-001 | Marketing Analyst | Marketing Analyst | Marketing | inactive | mid_level | 410 | 5 | 2 | 2 | 106.92 | 1 | 2026-02-23T13:04:07.345301 | 0 | 0 | N/A |
| 49 | JR-MARKETING-001 | Marketing Coordinator | Marketing Coordinator | Marketing | inactive | senior | 545 | 6 | 5 | 2 | 111.29 | 1 | 2026-02-23T13:04:06.750657 | 0 | 0 | N/A |
| 50 | MID-MOBILE-001 | Mobile Developer | Mobile Developer | Engineering | inactive | senior | 615 | 9 | 5 | 5 | 116.92 | 1 | 2026-02-23T13:04:05.471359 | 0 | 0 | N/A |
| 51 | MID-NETWORK-001 | Network Engineer | Network Engineer | Infrastructure | inactive | senior | 715 | 9 | 7 | 5 | 119.51 | 1 | 2026-02-23T13:04:05.577687 | 0 | 0 | N/A |
| 52 | JR-OFFICE-MGR-001 | Office Manager | Office Manager | Administration | inactive | mid_level | 495 | 3 | 5 | 3 | 107.53 | 1 | 2026-02-23T13:04:06.868852 | 0 | 0 | N/A |
| 53 | JR-PARTNERSHIPS-001 | Partnerships Coordinator | Partnerships Coordinator | Business Development | inactive | senior | 520 | 6 | 4 | 2 | 109.03 | 1 | 2026-02-23T13:04:08.165371 | 0 | 0 | N/A |
| 54 | JR-PRODUCT-ASSIST-001 | Product Assistant | Product Assistant | Product | inactive | mid_level | 420 | 6 | 2 | 2 | 107.65 | 1 | 2026-02-23T13:04:07.490914 | 0 | 0 | N/A |
| 55 | MID-PROD-MGR-001 | Product Manager | Product Manager | Product | inactive | senior | 650 | 10 | 6 | 5 | 118.72 | 1 | 2026-02-23T13:04:05.788231 | 0 | 0 | N/A |
| 56 | JR-PROJECT-ASST-001 | Project Assistant | Project Assistant | Operations | inactive | senior | 525 | 6 | 5 | 3 | 109.72 | 1 | 2026-02-23T13:04:06.924349 | 0 | 0 | N/A |
| 57 | MID-PROJ-MGR-001 | Project Manager | Project Manager | Operations | inactive | senior | 585 | 9 | 5 | 4 | 114.42 | 1 | 2026-02-23T13:04:05.834324 | 0 | 0 | N/A |
| 58 | MID-QA-001 | QA Engineer | QA Engineer | Engineering | inactive | senior | 565 | 10 | 5 | 3 | 115.06 | 1 | 2026-02-23T13:04:05.307067 | 0 | 0 | N/A |
| 59 | JR-SALES-001 | Sales Development Representative | Sales Development Representative | Sales | inactive | senior | 795 | 6 | 5 | 2 | 113.62 | 1 | 2026-02-23T13:04:06.809720 | 0 | 0 | N/A |
| 60 | MID-SEC-001 | Security Engineer | Security Engineer | Security | inactive | mid_level | 495 | 5 | 3 | 4 | 110.58 | 1 | 2026-02-23T13:04:05.231156 | 0 | 0 | N/A |
| 61 | SR-BACKEND-001 | Senior Backend Engineer | Senior Backend Engineer | Engineering | inactive | senior | 685 | 11 | 7 | 5 | 120.51 | 1 | 2026-02-23T13:04:04.169111 | 0 | 0 | N/A |
| 62 | SR-BUSINESS-ANALYST-001 | Senior Business Analyst | Senior Business Analyst | Business | inactive | senior | 585 | 9 | 5 | 4 | 115.62 | 1 | 2026-02-23T13:04:04.908521 | 0 | 0 | N/A |
| 63 | SR-CLOUD-001 | Senior Cloud Engineer | Senior Cloud Engineer | Engineering | inactive | senior | 595 | 7 | 5 | 5 | 115.46 | 1 | 2026-02-23T13:04:04.685064 | 0 | 0 | N/A |
| 64 | SR-DATA-ENG-001 | Senior Data Engineer | Senior Data Engineer | Data | inactive | senior | 585 | 9 | 5 | 4 | 115.62 | 1 | 2026-02-23T13:04:04.502881 | 0 | 0 | N/A |
| 65 | SR-DATABASE-001 | Senior Database Administrator | Senior Database Administrator | Data | inactive | senior | 605 | 5 | 5 | 6 | 115.29 | 1 | 2026-02-23T13:04:04.798930 | 0 | 0 | N/A |
| 66 | SR-DEVOPS-001 | Senior DevOps Engineer | Senior DevOps Engineer | Engineering | inactive | senior | 665 | 9 | 7 | 5 | 119.04 | 1 | 2026-02-23T13:04:04.328379 | 0 | 0 | N/A |
| 67 | SR-FRONTEND-001 | Senior Frontend Engineer | Senior Frontend Engineer | Engineering | inactive | senior | 655 | 8 | 7 | 5 | 118.31 | 1 | 2026-02-23T13:04:04.221934 | 0 | 0 | N/A |
| 68 | SR-FULLSTACK-001 | Senior Full Stack Engineer | Senior Full Stack Engineer | Engineering | inactive | senior | 660 | 11 | 6 | 5 | 119.45 | 1 | 2026-02-23T13:04:04.274818 | 0 | 0 | N/A |
| 69 | SR-ML-001 | Senior Machine Learning Engineer | Senior Machine Learning Engineer | Data | inactive | senior | 665 | 9 | 7 | 5 | 119.04 | 1 | 2026-02-23T13:04:04.560718 | 0 | 0 | N/A |
| 70 | SR-MOBILE-001 | Senior Mobile Developer | Senior Mobile Developer | Engineering | inactive | senior | 570 | 5 | 6 | 4 | 113.75 | 1 | 2026-02-23T13:04:04.631446 | 0 | 0 | N/A |
| 71 | SR-NETWORK-001 | Senior Network Engineer | Senior Network Engineer | Infrastructure | inactive | senior | 670 | 7 | 8 | 5 | 118.63 | 1 | 2026-02-23T13:04:04.738750 | 0 | 0 | N/A |
| 72 | SR-QA-001 | Senior QA Engineer | Senior QA Engineer | Engineering | inactive | senior | 600 | 8 | 6 | 4 | 115.95 | 1 | 2026-02-23T13:04:04.447851 | 0 | 0 | N/A |
| 73 | SR-SEC-001 | Senior Security Engineer | Senior Security Engineer | Security | inactive | senior | 615 | 9 | 5 | 5 | 116.92 | 1 | 2026-02-23T13:04:04.389385 | 0 | 0 | N/A |
| 74 | SR-ARCH-001 | Senior Solutions Architect | Senior Solutions Architect | Engineering | inactive | senior | 655 | 9 | 9 | 3 | 118.56 | 1 | 2026-02-23T13:04:04.102243 | 0 | 0 | N/A |
| 75 | SR-UI-001 | Senior UI/UX Designer | Senior UI/UX Designer | Design | inactive | senior | 680 | 10 | 6 | 6 | 120.02 | 1 | 2026-02-23T13:04:04.851301 | 0 | 0 | N/A |
| 76 | JR-SOCIAL-MEDIA-001 | Social Media Coordinator | Social Media Coordinator | Marketing | inactive | mid_level | 420 | 6 | 2 | 2 | 105.25 | 1 | 2026-02-23T13:04:07.835963 | 0 | 0 | N/A |
| 77 | JR-RECRUITER-001 | Technical Recruiter | Technical Recruiter | HR | inactive | mid_level | 420 | 3 | 2 | 3 | 104.35 | 1 | 2026-02-23T13:04:06.557000 | 0 | 0 | N/A |
| 78 | MID-SUPPORT-001 | Technical Support Engineer | Technical Support Engineer | Support | inactive | senior | 565 | 9 | 3 | 5 | 113.61 | 1 | 2026-02-23T13:04:05.921751 | 0 | 0 | N/A |
| 79 | JR-SUPPORT-001 | Technical Support Specialist | Technical Support Specialist | Support | inactive | senior | 540 | 10 | 4 | 3 | 110.40 | 1 | 2026-02-23T13:04:06.497527 | 0 | 0 | N/A |
| 80 | MID-TECH-WRITER-001 | Technical Writer | Technical Writer | Documentation | inactive | senior | 655 | 8 | 7 | 5 | 117.11 | 1 | 2026-02-23T13:04:05.897908 | 0 | 0 | N/A |
| 81 | JR-TRAINING-001 | Training Coordinator | Training Coordinator | HR | inactive | senior | 595 | 5 | 5 | 4 | 113.16 | 1 | 2026-02-23T13:04:07.094351 | 0 | 0 | N/A |
| 82 | MID-UI-001 | UI/UX Designer | UI/UX Designer | Design | inactive | senior | 580 | 11 | 4 | 4 | 114.83 | 1 | 2026-02-23T13:04:05.684067 | 0 | 0 | N/A |
| 83 | JR-UX-RESEARCHER-001 | UX Researcher | UX Researcher | Design | inactive | senior | 520 | 3 | 4 | 3 | 109.33 | 1 | 2026-02-23T13:04:07.776709 | 0 | 0 | N/A |
| 84 | VP-ENG-001 | Vice President of Engineering | Vice President of Engineering | Engineering | inactive | senior | 700 | 7 | 6 | 6 | 118.28 | 1 | 2026-02-23T13:04:03.514972 | 0 | 0 | N/A |
| 85 | VP-MKT-001 | Vice President of Marketing | Vice President of Marketing | Marketing | inactive | senior | 650 | 8 | 6 | 4 | 116.42 | 1 | 2026-02-23T13:04:03.603340 | 0 | 0 | N/A |
| 86 | VP-PROD-001 | Vice President of Product | Vice President of Product | Product | inactive | senior | 690 | 12 | 8 | 4 | 121.00 | 1 | 2026-02-23T13:04:03.546584 | 0 | 0 | N/A |
| 87 | VP-SALES-001 | Vice President of Sales | Vice President of Sales | Sales | inactive | senior | 580 | 11 | 4 | 4 | 116.03 | 1 | 2026-02-23T13:04:03.576536 | 0 | 0 | N/A |

## 5. Hallazgos principales
- No hay trazas operativas en `tasks`/`agent_usage`; por eso la columna de cumplimiento para la solicitud actual es `N/A` en los 87 agentes.
- El sistema si tiene evidencia de aprendizaje e IQ (tablas `agent_learning`, `agent_iq_events`, `agent_iq_snapshots`).
- Este reporte es snapshot del estado actual de DB en DEV, no reemplaza monitoreo streaming por agente.
