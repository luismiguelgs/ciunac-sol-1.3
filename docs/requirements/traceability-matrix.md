# Matriz de Trazabilidad de Requisitos

## Proposito
Relacionar requisitos funcionales con casos de uso, rutas Next.js y modulos principales. Esta matriz ayuda a revisar cambios, planificar pruebas y verificar que cada flujo visible tenga cobertura documental.

## Matriz Funcional
| Requisito | Caso de uso | Rutas principales | Modulos principales |
| --- | --- | --- | --- |
| RF-001 | CU-001, CU-002, CU-003, CU-004 | `app/solicitud-certificados/page.tsx`, `app/solicitud-beca/page.tsx`, `app/solicitud-ubicacion/page.tsx`, `app/solicitud-nuevo/page.tsx` | `modules/shared/components/email-verification-form.tsx` |
| RF-002 | CU-001, CU-002, CU-003, CU-004, CU-005, CU-007 | Solicitudes y consultas por documento | `modules/shared/components/email-verification-form.tsx`, `modules/consultas/presentation/components/consulta-form.tsx` |
| RF-003 | CU-001 | `app/solicitud-certificados/proceso/page.tsx` | `modules/solicitud-certificado` |
| RF-004 | CU-001 | `app/solicitud-certificados/proceso/page.tsx` | `modules/solicitud-certificado/presentation/components/basic-data.tsx` |
| RF-005 | CU-001, CU-003 | Procesos de certificado y ubicacion | Repositories y gateways de estudiante por feature |
| RF-006 | CU-001 | `app/solicitud-certificados/proceso/page.tsx`, `app/api/ciunac/[...path]/route.ts` | `certificate-form.mapper.ts`, `certificate-price-validation.ts` |
| RF-007 | CU-001, CU-003, CU-008 | Procesos de certificado, ubicacion y constancia | `modules/shared/components/fin-data.tsx`, `modules/shared/schemas/fin-data.schema.ts` |
| RF-008 | CU-003 | Proceso de ubicacion | `modules/solicitud-ubicacion/presentation/components/study-certificate.tsx` |
| RF-009 | CU-001, CU-003 | Procesos de certificado y ubicacion | Gateways de estudiante por feature |
| RF-010 | CU-001, CU-002, CU-003 | Pantallas de registro/finalizacion | Casos de uso y gateways de cada solicitud |
| RF-011 | CU-002 | `app/solicitud-beca/proceso/page.tsx`, `app/solicitud-beca/finalizar/page.tsx` | `modules/solicitud-beca/domain`, `modules/solicitud-beca/application`, `modules/solicitud-beca/infrastructure`, `modules/solicitud-beca/presentation` |
| RF-012 | CU-003 | `app/solicitud-ubicacion/proceso/page.tsx` | `modules/solicitud-ubicacion` |
| RF-013 | CU-003 | `app/solicitud-ubicacion/proceso/page.tsx` | `check-duplicate-solicitud-ubicacion.use-case.ts` |
| RF-014 | CU-004 | `app/solicitud-nuevo/page.tsx`, `app/solicitud-nuevo/finalizar/page.tsx` | `modules/solicitud-nuevo/domain`, `application`, `infrastructure`, `presentation`; API Q10 |
| RF-015 | CU-005 | `app/consulta-solicitud/page.tsx`, `app/consulta-solicitud/[dni]/page.tsx` | `modules/consulta-solicitud` |
| RF-016 | CU-006 | `app/consulta-certificado/page.tsx`, `app/consulta-certificado/[id]/page.tsx` | `modules/consulta-certificado/domain`, `modules/consulta-certificado/application`, `modules/consulta-certificado/infrastructure`, `modules/consulta-certificado/presentation` |
| RF-017 | CU-007 | `app/consulta-ubicacion/page.tsx`, `app/consulta-ubicacion/[dni]/page.tsx` | `modules/consulta-ubicacion/domain`, `modules/consulta-ubicacion/application`, `modules/consulta-ubicacion/infrastructure`, `modules/consulta-ubicacion/presentation` |
| RF-018 | CU-001, CU-002, CU-003, CU-004, CU-005, CU-006, CU-007 | Todos los flujos principales | Componentes de presentation y dialogs |
| RF-019 | CU-008 | `app/solicitud-constancias/page.tsx`, `app/solicitud-constancias/proceso/page.tsx` | `modules/solicitud-constancia` |
| RF-020 | CU-008 | `app/solicitud-constancias/finalizar/page.tsx` | `modules/solicitud-constancia/presentation/components/cargo-pdf.tsx`, `modules/solicitud-constancia/presentation/components/descarga-cargo.tsx` |
| RF-021 | CU-003 | `app/solicitud-ubicacion/page.tsx`, `app/api/ciunac/[...path]/route.ts` | `location-catalog.repository.ts`, `location-request-validation.ts` |
| RF-022 | CU-003 | `app/api/security/ubicacion/profile/route.ts`, proceso de ubicacion | `location-profile-session.ts`, `location-request-validation.ts` |
| RF-023 | CU-003 | `/api/ciunac/upload/dnis`, `/upload/vouchers`, `/upload/becas` | Validadores de archivos de ubicacion y compartidos |

## Cobertura de Flujos Visibles
| Flujo visible | Estado documental |
| --- | --- |
| Solicitud de certificados | Cubierto por CU-001 |
| Solicitud de beca | Cubierto por CU-002 |
| Solicitud de examen de ubicacion | Cubierto por CU-003 |
| Solicitud de alumno nuevo | Cubierto por CU-004 |
| Consulta de solicitud | Cubierto por CU-005 |
| Consulta de certificado | Cubierto por CU-006 |
| Consulta de ubicacion | Cubierto por CU-007 |
| Solicitud de constancia | Cubierto por CU-008 |
| Home `app/page.tsx` | Fuera de alcance funcional especifico; actua como entrada/navegacion |

## Matriz Visual
```mermaid
flowchart LR
    RF["Requisitos funcionales RF-*"] --> CU["Casos de uso CU-*"]
    CU --> Routes["Rutas app/*"]
    Routes --> Modules["Modulos modules/*"]
    Modules --> APIs["API CIUNAC / API Q10 / Correo / Archivos"]
```

