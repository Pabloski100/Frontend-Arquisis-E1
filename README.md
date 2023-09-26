# IIC2173 - E1 | Fintech Async en 2023-2 | Grupo 28

## Tabla de Contenidos

1. [Introducción](#introducción)
2. [Auth0 env variables](#auth0-env-variables)
3. [Views](#views)
4. [Requisitos Funcionales](#requisitos-funcionales-clipboard)
5. [Requisitos No Funcionales](#requisitos-no-funcionales-wrench) !
6. [Instrucciones de Despliegue](#instrucciones-de-despliegue-rocket)

--- 

## Introducción :loudspeaker:

Este proyecto consiste en una API REST que permite a los usuarios de la aplicación realizar transacciones de compra y venta de acciones de empresas. Para esto, se utiliza la API de [Auth0](https://auth0.com/) para la autenticación de los usuarios.

Las tecnologías utilizadas en este proyecto son:

- NestJS, React, TypeScript, TypeORM
- PostgreSQL
- Auth0
- Docker swarm
- AWS S3
- Cloudfront
- API Gateway: Lambda + PostgreSQL

## Auth0 env variables (Aviso) :red_circle:

Si el token expira deben crearse una nueva cuenta y cambiar los valores del env.local de aqui y de la API:

``````
AUTH0_SECRET='e68278ea73c6cf442e2e4ef87ad442ce1c78076056372a4bb5dca171dabb1e7a'
AUTH0_BASE_URL='http://localhost:8000'
AUTH0_ISSUER_BASE_URL='https://dev-c6qwwrh4suoknli2.us.auth0.com'
AUTH0_CLIENT_ID='3U13tKK65n8K0Hc3kfJfdIn73Fiu08kJ'
AUTH0_CLIENT_SECRET='5yYyQL64mbIMjcQHdXnXnRFWv17wzOrEOVB5R-sT-emR1oTE49DUN6ZyPS7DG-XZ'
AUTH0_AUDIENCE='https://dev-c6qwwrh4suoknli2.us.auth0.com/api/v2/'
AUTH0_SCOPE='openid profile email read:shows update:users'
``````

## Views

La paǵina web deployada en AWS S3 tiene el siguiente URL: !!!

Luego, las vistas de la aplicación son las siguientes:

- **Home**: Página de landing. Da a conocer el uso y propósito de la paǵina web al usuario.
- **Log In**: Permite al usuario iniciar sesión en la aplicación o registrarse (autentificación facilitada por Auth0).

Una vez que el usuario inicia sesión, se despliegan las siguientes vistas en la navbar:

- **Stocks**: Muestra todos los batches de stocks (acciones) que han llegado y acumulado en nuestra base de datos. Todas estas tienen la opción (botón) `View History` con la cual se puede ver en detalle el stock elegido y si está disponible o no para *comprar*. Desde esta misma vista es posible también comprar una acción (si el dinero alcanza, de lo contrario se levanta una alerta) y visitar el resto de los stocks usando (botón) `Next` y `Back`. 

 disponibes uestra la información de las empresas y permite comprar y vender acciones.
- **My Stocks**: Una vez que el usuario compra al menos un stock, en esta vista se le muestra la información de dicho stock y la opción de venderlas (si el usuario posee acciones de la empresa). También posee un gráfico que muestra la evolución del precio del stock de la misma compañía en intervalos de una hora.
- **External API**: Viene por defecto por la página proveida por Auth0. Más información ver [acá](https://github.com/auth0-samples/auth0-nextjs-samples/tree/main/Sample-01).

A su vez, clickeando en ícono del usuario loggeado se despliega un menú con las siguientes opciones:
- **Profile**: Muestra la información del usuario (mail y dinero en billetera) y permite actualizarla. Permite depositar dinero a la billetera del usuario.
- **Logout**: Permite al usuario cerrar sesión.

## Requisitos Funcionales :clipboard:

### E1

- [x] **RF01**: El sistema se vale de Auth0 para la autenticación de los usuarios permitiendo correo electrónico y contraseña. Billetera virtual, que se puede cargar por el usuario, también disponible.

- [x] **RF02**: El sistema permite a los usuarios ver un listado de las acciones de empresas disponible por orden de llegada.

- [x] **RF03**: Acciones están paginadas y brinda la acción de compra.

- [x] **RF04**: Al acceder al detalle de una acción comprada por el usuario (View My Stocks)el sistema indica desde dónde el usuario hizo la compra gracias al uso de su ip.

- [x] **RF05**: Al comprar se informa que acción se realizó correctamente (también se indica cuando no se puede comprar por falta de dinero).
    - [x] **RF05 BONUS**: Gráfico implementado. Muestra evolución del precio de la acción en intervalos de una hora.

## Requisitos No Funcionales :wrench:

### E1

- [x] **RNF01**: Front implementado como SPA con React. Repositorio independiente, separado del Backend.

- [x] **RNF05**: Frontend utiliza HTTPS. !!! (AWS S3)

- [x] **RNF06**: Servicio de autentificación/autorización implementado con Auth0.
    - [x] **RNF06 BONUS**: No implementado.

- [x] **RNF07**: Frontend desplegado en S3 con distribución de CloudFront. !!!!

- [x] **RNF09**: CircleCI implementado usando Github Actions.
    - [x] **RNF09 BONUS**: No implementado.


## Instrucciones de Despliegue :rocket:

Indicadas en /docs como fue pedido en el enunciado de la entrega.

