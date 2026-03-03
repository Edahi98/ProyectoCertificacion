// --- Configuración Inicial ---
console.log("Wallet address:", pg.wallet.publicKey.toString());

const [postPda] = await web3.PublicKey.findProgramAddress(
  [Buffer.from("posts"), pg.wallet.publicKey.toBuffer()],
  pg.program.programId
);

async function runTest() {
  try {
    // 1. Crear el Post (si no existe)
    let accountInfo = await pg.connection.getAccountInfo(postPda);
    if (!accountInfo) {
      console.log("Creando nuevo post...");
      await pg.program.methods
        .crearPost("Multiverso Anime", "#FF5733", "Generación Actual")
        .accounts({
          owner: pg.wallet.publicKey,
          post: postPda,
          systemProgram: web3.SystemProgram.programId,
        })
        .rpc();
    }

    // 2. Lista de personajes a agregar con los poderes de tu lista en Rust
    const personajesNuevos = [
      {
        nombre: "Zoro",
        edad: 21,
        desc: "Espadachín que busca ser el mejor",
        poder: "Ninguno"
      },
      {
        nombre: "Kisame",
        edad: 32,
        desc: "Ninja renegado de la niebla",
        poder: "Controlar el agua"
      },
      {
        nombre: "Sanji",
        edad: 21,
        desc: "Cocinero con piernas ardientes",
        poder: "Caminar por el fuego"
      },
      {
        nombre: "Enel",
        edad: 500,
        desc: "Dios de Skypiea",
        poder: "Caminar por la luna"
      }
    ];

    // 3. Bucle para agregar a todos los personajes
    for (const p of personajesNuevos) {
      console.log(`Agregando a ${p.nombre}...`);
      await pg.program.methods
        .agregarPersonaje(p.nombre, p.edad, p.desc, p.poder)
        .accounts({
          owner: pg.wallet.publicKey,
          post: postPda,
        })
        .rpc();
    }

    // 4. Ver los datos finales
    const postData = await pg.program.account.post.fetch(postPda);
    console.log("\n--- LISTA ACTUALIZADA DE PERSONAJES ---");
    console.log("Anime:", postData.tituloAnime);
    
    postData.personajes.forEach((p, i) => {
      console.log(`${i + 1}. ${p.nombre} | Edad: ${p.edad} | Poder: ${p.superpoder}`);
    });

  } catch (err) {
    console.error("Error en la ejecución:", err);
  }
}

await runTest();
