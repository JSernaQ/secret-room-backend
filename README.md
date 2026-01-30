# SECRET ROOM 🔐
## Encrypted Anonymous Chat – Backend

Backend para una aplicación de **chat anónimo, en tiempo real y con cifrado end‑to‑end (E2E)**.
El servidor **nunca conoce el contenido de los mensajes**, solo actúa como intermediario de transporte.

---

## Características principales

* Chat en tiempo real con **WebSockets (Socket.IO)**
* **Cifrado E2E** usando **AES‑256‑GCM**
* Anónimo (sin login, sin registro)
* El servidor **no puede descifrar mensajes**
* Salas privadas con `roomId`
* Limpieza automática de salas
* Arquitectura simple y eficiente

---

## 🛠️ Stack tecnológico

| Capa            | Tecnología               |
| --------------- | ------------------------ |
| Runtime         | Node.js                  |
| Framework       | NestJS                   |
| Realtime        | Socket.IO                |
| Lenguaje        | TypeScript               |
| Cifrado         | Web Crypto API (AES‑GCM) |
| Infraestructura | Docker        |

---

## 🔐 Modelo de seguridad (E2E)

* La clave **se genera en el cliente**
* El servidor **nunca recibe ni genera claves**
* Cada mensaje se envía como:

  * `ciphertext`
  * `iv` (vector de inicialización)
* Se usa **AES‑256‑GCM**, que provee:

  * Confidencialidad
  * Integridad
  * Autenticación del mensaje

📌 Si el `ciphertext`, `iv` o la clave no coinciden, el mensaje **no puede descifrarse**.

---

## 📡 Eventos de Socket

### 🔹 CREATE_ROOM

Crea una nueva sala de chat.

```ts
{
  alias: string;
}
```

Respuesta:

```ts
{
  roomId: string;
  alias: string;
}
```

---

### 🔹 JOIN_ROOM

Permite unirse a una sala existente.

```ts
{
  roomId: string;
  alias: string;
}
```

---

### 🔹 MESSAGE

Envía un mensaje cifrado.

```ts
{
  roomId: string;
  type: 'user' | 'system';
  ciphertext: string;
  iv: string;
  timestamp: number;
}
```

📌 El backend **no interpreta ni valida el contenido** del mensaje.

---

### 🔹 LEAVE_ROOM

Sale de una sala.

```ts
{
  roomId: string;
  alias: string;
}
```

---

## ▶️ Ejecución local

```bash
pnpm install
pnpm run start:dev
```

El servidor quedará disponible en:

```
http://localhost:3000
```

---

## 📂 Estructura del proyecto

```text
src/
 ├── modules
 |   ├── chat/
 │       ├── chat.gateway.ts
 |       └── services
 │           ├── rate-limit-entry.service.ts
 |           └── chat.service.ts
 ├── common/
 |   ├── constanst
 |   ├── dto
 |   └── utils
 └── main.ts
```

---

## Limitaciones actuales

* No hay intercambio criptográfico avanzado (ECDH)
* La clave se deriva de un secreto compartido simple (`roomId`)

> Estas decisiones son **intencionales** para mantener el sistema ligero y educativo.

---

## Próximos pasos (Roadmap)

* 🔑 Intercambio de claves con **ECDH**
* 🛡️ Protección contra replay attacks
* 📦 Persistencia opcional cifrada

---

## 👨‍💻 Autor

Proyecto desarrollado por **Juan David Serna Quilindo**.

Enfocado en:

* Backend
* Seguridad
* Arquitectura de sistemas
* Cifrado aplicado

---

## 📜 Licencia

MIT License

---

