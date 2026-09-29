# Arquitectura del Frontend CIUNAC

Estado implementado al 2026-09-28, aplicacion 1.6.6.

Next.js App Router combina Server Components con formularios cliente. El sistema
esta organizado por feature, con reglas puras separadas de UI e integracion.
No se exige una carpeta, command, port o clase por responsabilidad.

- Cinco solicitudes: certificado, constancia, beca, ubicacion y alumno nuevo.
- Consultas de solicitudes y ubicacion con sesion; certificado publico por QR.
- React Hook Form para edicion y Zustand para workflows entre pasos.
- BFF para API key privada, OTP, CAPTCHA, autorizacion y validacion server-side.
- Capacidades compartidas estables: pago, archivos, HTTP browser, UI y renderer PDF.
- Cargos generados en frontend bajo demanda; documentos digitales externos no se regeneran.
- Funciones testeables y entradas publicas index/client/server, sin imports internos cruzados.

La simplificacion de los pasos 1 a 8 esta cerrada. No equivale a aprobar despliegue:
la auditoria de dependencias tiene hallazgos bloqueantes y excepciones vencidas.

## Leer segun la necesidad

- [Mapa con diagramas](complete-architecture.md): como se conectan navegador, features y BFF.
- [SDD](sdd.md): diseno implementado, contratos, estado, despliegue y riesgos.
- [Lectura de codigo: consulta-certificado](walkthroughs/consulta-certificado.md): archivos, llamadas, datos y seguridad del QR publico.
- [Lectura de codigo: consulta-solicitud](walkthroughs/consulta-solicitud.md): CAPTCHA, sesion, resultados, cargo local y descarga digital.
- [Convenciones](conventions.md): como agregar un feature sin ceremonia.
- [ADR-031](adr/031-pragmatic-feature-architecture.md): decision general y alternativas.
- [Evidencia de cierre](../quality/pragmatic-simplification-baseline.md#paso-8-cierre-documental-y-limpieza).
