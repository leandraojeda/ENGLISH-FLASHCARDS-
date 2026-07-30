# FluentUp — English Flashcards

Aplicación web para guardar palabras y frases en inglés, practicar su
significado en español y seguir el progreso de aprendizaje.

## Funciones

- Registro de palabras o frases, traducción y ejemplo.
- Repaso interactivo con validación de respuestas.
- Estadísticas de aciertos, precisión y progreso.
- Colección completa de tarjetas.
- Persistencia con Supabase y modo local automático si no hay claves.
- Diseño responsive, listo para Vercel.

## Desarrollo local

Requiere Node.js 22 o superior.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Visita `http://localhost:3000`.

## Configurar Supabase

1. Crea un proyecto en Supabase.
2. Abre el SQL Editor y ejecuta `supabase/schema.sql`.
3. Copia `.env.example` como `.env.local`.
4. Añade la URL y la clave pública `anon` del proyecto.

> La política incluida es adecuada para una primera versión personal. Para una
> app pública multiusuario se recomienda añadir Supabase Auth y asociar cada
> tarjeta a un usuario.

## Desplegar en Vercel

1. Importa este repositorio desde Vercel.
2. Añade `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` y
   `NEXT_PUBLIC_SITE_URL` en Project Settings → Environment Variables.
3. Despliega. Vercel detectará Next.js automáticamente.

## Comandos

```bash
npm run dev
npm run build
npm run start
```
