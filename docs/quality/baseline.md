# Linea Base de Calidad

## Identificacion
- Fecha: 2026-08-03.
- Alcance: Fase 1A, smoke tests E2E del comportamiento actual.
- Gestor de paquetes: npm 11.6.2.
- Node.js local: 24.11.1.
- Next.js instalado: 16.1.0.
- React instalado: 19.2.3.
- TypeScript instalado: 5.9.3.

## Verificacion de Next.js
El gestor de paquetes confirmo que la etiqueta `latest` de Next.js apunta a `16.2.12` al iniciar esta fase. Este dato se registra solamente como referencia: la Fase 1A no actualiza Next.js ni `eslint-config-next`.

## Linea base previa
Antes de crear los smoke tests se comprobaron estos comandos:
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto, con 20 rutas generadas.
- Tests automatizados: no existia un script ni framework configurado.

## Cobertura de Fase 1A
- Render de las 20 rutas publicas conocidas.
- Navegacion desde la portada al flujo de certificados.
- Verificacion de correo de certificados con OTP y reCAPTCHA simulados.
- Registro completo de una solicitud de certificado.
- Consulta de solicitud por documento.
- Consulta de certificado y notas.
- Consulta de examen de ubicacion y resultado.

Las integraciones CIUNAC, Q10, correo, almacenamiento y reCAPTCHA se sustituyen por dobles locales deterministas. El flujo incompleto de constancias solo se cubre hasta la pantalla de proceso actual; no se fija su comportamiento defectuoso como resultado esperado.

## Resultado posterior
- `npm test`: correcto, 26 de 26 smoke tests en Chromium.
- `npm run lint`: correcto.
- `npx tsc --noEmit`: correcto.
- `npm run build`: correcto en directorio aislado `.next-e2e`, con 20 rutas generadas.
- Next.js se mantiene en 16.1.0; no se actualizaron Next.js, React ni `eslint-config-next`.

La Fase 1A queda cerrada. No se iniciaron cambios de las Fases 1B, 1C, 1D o 1E.

## Resultado de Fase 1C
- Next.js: 16.2.12.
- React y React DOM: 19.2.3.
- TypeScript: 5.9.3.
- Vitest: 4.1.10.
- `server-only`: 0.0.1.
- `npm run lint`: correcto, sin errores ni warnings.
- `npx tsc --noEmit`: correcto.
- `npm run test:unit`: correcto, 11 de 11 pruebas.
- `npm run test:e2e`: correcto, 27 de 27 smoke tests.
- `npm run build`: correcto, 25 rutas totales; 5 Route Handlers de seguridad/BFF.
- `npm run security:bundle-check`: correcto; no se detectaron valores privados configurados en `.next/static`.
- `git diff --check`: correcto; solo se informan conversiones de fin de linea propias de Windows.

`npm run env:check` funciona y falla de manera esperada en el entorno local actual: falta `API_URL` canonica, falta `RECAPTCHA_SECRET_KEY` y `NEXT_PUBLIC_API_KEY` continua configurada hasta completar la rotacion manual. `NEXT_PUBLIC_API_URL` solo se acepta como fallback server-only transitorio. No se modifico el `.env` real.

Advertencias pendientes:
- La instalacion reporta 9 vulnerabilidades de dependencias transitivas: 1 baja, 1 moderada y 7 altas. No se ejecuto `npm audit fix` porque esta fase no autoriza actualizaciones no relacionadas.
- Next.js informa una recomendacion LCP para `/images/email-verification.png`; no bloquea el flujo de seguridad.
- En Windows, los servidores hijos de Playwright permanecieron escuchando al finalizar y se detuvieron manualmente despues de obtener resultados exitosos. Conviene aislar su lifecycle en una mejora posterior del runner.

La Fase 1C queda implementada y verificada en codigo, pero no se considera desplegable hasta configurar los secretos privados, rotar/revocar la API key expuesta y obtener un `env:check` exitoso.
