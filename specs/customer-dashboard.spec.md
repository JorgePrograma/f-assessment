# Spec: Customer Dashboard

> Spec-Driven Development: este documento es la fuente de verdad del comportamiento.
> Cada criterio de aceptación (`AC-xx`) está cubierto por al menos una prueba automatizada,
> referenciada por su identificador.

## 1. Contexto

Pantalla única, **Customer Dashboard**, para visualizar y administrar la lista de clientes
expuesta por la Customers API (`GET /customers`, `GET /customers/{id}`, `PATCH /customers/{id}/status`).

## 2. Modelo

| Campo       | Tipo                               | Presentación                                     |
| ----------- | ---------------------------------- | ------------------------------------------------ |
| `id`        | UUID                               | Solo en el detalle.                              |
| `name`      | string                             | Texto.                                           |
| `email`     | string                             | Texto.                                           |
| `status`    | `ACTIVE` \| `PENDING` \| `BLOCKED` | `<StatusBadge>`: Activo / Pendiente / Bloqueado. |
| `createdAt` | Date                               | Fecha local legible (ej. `25 oct 2026`).         |

## 3. Listado

| ID    | Criterio de aceptación                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------- |
| AC-01 | Al entrar se consultan los clientes a la API y se muestran nombre, email, estado y fecha de registro. |
| AC-02 | En desktop y tablet (≥ 768 px) se muestran en una tabla; en mobile, como tarjetas.                    |
| AC-03 | El estado se muestra siempre con el componente reutilizable `<StatusBadge status="…" />`.             |

## 4. Filtro, búsqueda y paginación

| ID    | Criterio de aceptación                                                                                                                                                |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-04 | Un filtro con las opciones **Todos, Activos, Pendientes, Bloqueados** limita la lista al estado elegido.                                                              |
| AC-05 | Un campo de búsqueda filtra por nombre o email. La consulta se envía 300 ms después de dejar de escribir.                                                             |
| AC-06 | Cambiar filtro o búsqueda vuelve a la página 1.                                                                                                                       |
| AC-07 | Con más de una página se muestra la paginación (“Mostrando X–Y de Z”, anterior/siguiente).                                                                            |
| AC-08 | Filtro, búsqueda y página se reflejan en la URL (`?status=&search=&page=`): recargar o compartir el enlace conserva la vista. Valores inválidos en la URL se ignoran. |
| AC-24 | Un selector **Filas por página** (5, 10, 20, 50) cambia el tamaño de página, vuelve a la página 1 y se refleja en la URL (`?size=`).                                  |

## 5. Estados

| ID    | Criterio de aceptación                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-09 | **Loading inicial**: se muestra un esqueleto con la forma de la lista.                                                                             |
| AC-10 | **Recarga** (cambio de filtro/página con datos ya visibles): se conservan los datos atenuados y se indica que está cargando, sin saltos de layout. |
| AC-11 | **Error de API**: mensaje comprensible según el tipo de error (sin conexión, error del servidor…) y botón **Reintentar**.                          |
| AC-12 | **Lista vacía sin filtros**: mensaje “Aún no hay clientes registrados”.                                                                            |
| AC-13 | **Sin resultados con filtros**: mensaje específico y botón **Limpiar filtros**.                                                                    |
| AC-14 | Si llegan respuestas fuera de orden (ej. el usuario escribe rápido), solo se muestra la de la última consulta.                                     |

## 6. Detalle

| ID    | Criterio de aceptación                                                                                                                        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-15 | Cada cliente tiene un botón **Ver detalle** que abre un modal con todos sus datos.                                                            |
| AC-16 | El modal se cierra con el botón cerrar, con `Esc` o haciendo clic fuera; el foco vuelve al botón que lo abrió.                                |
| AC-17 | Desde el detalle se puede cambiar el estado del cliente; al guardar se actualiza la lista. Si falla, se muestra el error sin cerrar el modal. |

## 7. Alta de clientes

| ID    | Criterio de aceptación                                                                                                                                    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AC-18 | Un botón **Nuevo cliente** abre un formulario con nombre y email que crea el cliente con `POST /customers`.                                               |
| AC-19 | Antes de enviar se valida: nombre obligatorio (máx. 120 caracteres) y email con formato válido. Cada error se muestra junto a su campo.                   |
| AC-20 | Si el email ya está registrado (`409`) o la API rechaza un campo (`422`), el error se muestra en ese campo sin cerrar el formulario ni perder lo escrito. |
| AC-21 | Al crear, se cierra el formulario, se notifica “Cliente creado”, se quitan los filtros y la lista se recarga mostrando al nuevo cliente primero.          |

## 8. Métricas

| ID    | Criterio de aceptación                                                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| AC-22 | Sobre la lista se muestran tarjetas con el total de clientes y la cantidad por estado, con su porcentaje del total (`GET /customers/summary`). Mientras cargan se muestra un esqueleto.                            |
| AC-23 | Cada tarjeta filtra la lista por su estado (la de total quita el filtro) e indica cuál está activa; volver a pulsar la activa quita el filtro. Las tarjetas se actualizan al crear un cliente o cambiar un estado. |

## 9. Accesibilidad y UX

- Controles con etiqueta accesible; el filtro indica la opción activa (`aria-pressed`).
- Los cambios de estado de la lista se anuncian a lectores de pantalla (`aria-live`).
- Usable con teclado en todos los tamaños de pantalla.

## 10. Fuera de alcance

- Edición de nombre/email.
- Autenticación.
