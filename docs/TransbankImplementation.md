
# Documentación de Integración con WebPay en la Aplicación de Compra de Acciones (Actualizada)

## Índice

1. Introducción
2. Arquitectura General
3. Flujo de Compra de Acciones
   - Frontend en React
   - Backend en NestJS
4. Confirmación de Compra
5. Finalización de la Transacción
6. Servicios Auxiliares
7. Conclusión

---

## 1. Introducción

Este documento ha sido actualizado para incluir los pasos adicionales seguidos para implementar la integración con WebPay en una aplicación que permite a los usuarios comprar acciones. La aplicación utiliza una arquitectura de frontend en React y un backend en NestJS.

## 2. Arquitectura General

- **Frontend**: Desarrollado en React, se encarga de las interacciones del usuario.
- **Backend**: Desarrollado en NestJS, maneja la lógica de negocio y la integración con WebPay.

## 3. Flujo de Compra de Acciones

### Frontend en React

#### Archivo: `stocks.js`

**Función: `handleBuyStock`**

Esta función se activa cuando un usuario decide comprar una acción.

1. **Obtener la ubicación del usuario**: Se hace una solicitud GET a `https://ipinfo.io/json?token=f27743517e5212` para obtener la ubicación del usuario.

2. **Enviar intención de compra al backend**: Se realiza una solicitud POST a `https://nicostocks.me/buyIntention` con detalles como el ID del usuario, el ID de la acción, el precio, etc.

3. **Navegar a la confirmación**: Si la solicitud es exitosa, el usuario es redirigido a `/confirm-purchase` con los detalles de la transacción.

### Backend en NestJS

#### Archivo: `app.controller.ts`

**Método HTTP: `POST /buyIntention`**

Este endpoint maneja la intención de compra del usuario.

1. **Crear una nueva transacción de WebPay**: Se usa la librería `WebpayPlus` para crear una nueva transacción.

2. **Almacenar detalles de la transacción**: Se invoca el método `storeTransactionDetails` para almacenar los detalles en la base de datos.

3. **Comprar la acción**: Se invoca el método `buyStock` para actualizar la base de datos con los detalles de la compra.

4. **Retornar resultados**: Si todo es exitoso, se retorna un objeto con un token y una URL para continuar con el proceso de compra.

## 4. Confirmación de Compra

#### Archivo: `confirmPurchase.js`

Esta vista muestra los detalles de la acción que el usuario está a punto de comprar y pide confirmación.

- El usuario puede confirmar la compra, lo que envía un formulario POST al URL proporcionado por WebPay.

## 5. Finalización de la Transacción

### Backend en NestJS

#### Archivo: `app.controller.ts`

**Método HTTP: `POST /confirm-purchase`**

Este endpoint confirma la transacción de compra de acciones y actualiza la base de datos correspondiente.

1. **Validar Token**: Se verifica que el `token_ws` exista en la solicitud.

2. **Confirmar Transacción**: Se utiliza la librería `WebpayPlus` para confirmar la transacción con `tx.commit(token_ws)`.

3. **Recuperar Detalles**: Se obtienen los detalles de la transacción a partir del token usando `getTransactionDetailsByToken`.

4. **Actualizar Usuario y Acciones**: Se actualiza el balance del usuario y los detalles de las acciones que compró mediante `updateUserBalanceAndStocks`.

5. **Retornar Resultados**: Se retorna un objeto con detalles importantes de la transacción si todo es exitoso.

## 6. Servicios Auxiliares

### Backend en NestJS

#### Archivo: `app.service`

**Método: `buyStock`**

Este método se encarga de publicar la solicitud de compra de una acción a un broker de mensajes por MQTT.

- Verifica si el usuario tiene fondos suficientes para la compra.
- Publica la solicitud en el tópico `stocks/requests`.

**Método: `updateUserBalanceAndStocks`**

Este método actualiza el balance del usuario y añade la acción adquirida a su cartera.

- Reduce el balance del usuario en la cantidad correspondiente al precio de la acción.
- Publica un mensaje de validación en el tópico `stocks/validation`.
- Actualiza la base de datos con los nuevos detalles.


