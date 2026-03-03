# 🎌 Solana Anime Program (Anchor)

Este es un programa desarrollado en **Solana** utilizando el framework **Anchor**. Permite a los usuarios crear un "Post" de su anime favorito y gestionar una lista de personajes (CRUD) con validaciones específicas de superpoderes directamente en la blockchain.

## 🚀 Características

* **Persistencia On-Chain:** Los datos se guardan en cuentas PDA (Program Derived Addresses) vinculadas a la wallet del autor.
* **Validación de Superpoderes:** El programa solo permite asignar poderes de una lista predefinida:
    * `Controlar el agua`
    * `Caminar por el fuego`
    * `Caminar por la luna`
    * `Ninguno`
* **Gestión de Personajes:** Funciones para agregar, eliminar y actualizar la edad de los personajes.
* **Seguridad:** Validación de propiedad (`Owner`) para asegurar que solo tú puedas modificar tus listas.

## 🛠️ Tecnologías utilizadas

* **Rust** & **Anchor Framework**
* **Solana Web3.js** (Client side)
* **Solana Playground** (IDE de desarrollo)

## 📦 Estructura del Programa

### Instrucciones (Methods)

| Método | Descripción |
| :--- | :--- |
| `crear_post` | Inicializa la cuenta del post con título, autor y color. |
| `agregar_personaje` | Añade un nuevo personaje al vector (Máx. 10). |
| `eliminar_personaje` | Remueve un personaje de la lista por su nombre. |
| `alternar_edad` | Modifica la edad de un personaje existente. |
| `ver_personajes` | Lanza un log con la lista detallada de personajes. |

---

## 🔧 Configuración y Despliegue

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/Edahi98/ProyectoCertificacion.git
   ```
2. Abrir en Solana Playground:

* Sube los archivos a Solana Playground.

* Cambia el declare_id! en lib.rs por tu Program ID generado.

3. Build & Deploy:
# En la terminal de Playground
build
deploy

🖥️ **Ejemplo del Cliente (TypeScript)
Para interactuar con el programa, puedes usar el siguiente snippet en la pestaña Client
```js
const [postPda] = await web3.PublicKey.findProgramAddress(
  [Buffer.from("posts"), pg.wallet.publicKey.toBuffer()],
  pg.program.programId
);

await pg.program.methods
  .agregarPersonaje("Luffy", 19, "Capitán", "Ninguno")
  .accounts({
    owner: pg.wallet.publicKey,
    post: postPda,
  })
  .rpc();
```
⚠️ **Errores Personalizados
El programa incluye un sistema de manejo de errores (error_code, como:

* LongitudNoEsperada: Campos vacíos o con espacios.

* SuperPoderNoEncontrado: El poder asignado no está en la lista permitida.

* NoEresElOwner: Intento de modificación por una wallet ajena.

Creado con 💙 por Edahi98
