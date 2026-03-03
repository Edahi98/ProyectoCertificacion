use anchor_lang::prelude::*;

// Coloca aquí el ID real de tu programa generado al deployar, no lo dejes vacío
declare_id!("51Pb49q417gF456ULG1duEqPzE9VfLSXVBsc87f9WxEe");

// Constantes fuera del módulo #[program]
const SUPER_PODERES: [&str; 4] = [
    "Controlar el agua",
    "Caminar por el fuego",
    "Caminar por la luna",
    "Ninguno",
];

#[program]
pub mod anime {
    use super::*;

    pub fn crear_post(ctx: Context<NuevoPost>, titulo_anime: String, color_fondo: String, autor: String) -> Result<()> {
        // Validaciones optimizadas (sin tantos to_string innecesarios)
        if titulo_anime.trim().is_empty() || color_fondo.trim().is_empty() || autor.trim().is_empty() {
            return Err(Errores::LongitudNoEsperada.into());
        }

        let owner = ctx.accounts.owner.key();

        // Inicializamos el vector vacío de personajes
        let personajes: Vec<Personaje> = Vec::new();

        ctx.accounts.post.set_inner(Post {
            owner,
            titulo_anime,
            color_fondo,
            autor,
            personajes,
        });

        msg!("Post creado: {}", ctx.accounts.post.titulo_anime);
        Ok(())
    }

    pub fn agregar_personaje(
        ctx: Context<NuevoPersonaje>,
        nombre: String,
        edad: u16,
        descripcion: String,
        superpoder: String,
    ) -> Result<()> {
        if nombre.trim().is_empty() || edad == 0 || descripcion.trim().is_empty() || superpoder.trim().is_empty() {
            return Err(Errores::LongitudNoEsperada.into());
        }

        if !SUPER_PODERES.iter().any(|&p| p == superpoder) {
            return Err(Errores::SuperPoderNoEncontrado.into());
        }

        let personajes = &mut ctx.accounts.post.personajes;

        // Reallocation necesaria si excedemos espacio (no incluida aquí, debes manejarla manualmente)
        if personajes.len() >= Post::MAX_PERSONAJES {
            return Err(Errores::EspacioInsuficiente.into()); // Puedes agregar este error si quieres
        }

        personajes.push(Personaje {
            nombre,
            edad,
            descripcion,
            superpoder,
        });

        msg!("Personaje {} agregado correctamente", personajes.last().unwrap().nombre);
        Ok(())
    }

    pub fn eliminar_personaje(ctx: Context<NuevoPersonaje>, nombre: String) -> Result<()> {
        let personajes = &mut ctx.accounts.post.personajes;

        if let Some(pos) = personajes.iter().position(|p| p.nombre == nombre) {
            personajes.remove(pos);
            msg!("Personaje eliminado: {}", nombre);
            Ok(())
        } else {
            Err(Errores::PersonajeNoEncontrado.into())
        }
    }

    pub fn ver_personajes(context: Context<NuevoPersonaje>) -> Result<()> {
        require!( // Medida de seguridad 
            context.accounts.post.owner == context.accounts.owner.key(),
            Errores::NoEresElOwner
        );

        msg!("La lista de libros actualmente es: {:#?}", context.accounts.post.personajes);
        Ok(())
    }

    pub fn alternar_edad(ctx: Context<NuevoPersonaje>, nombre: String, edad: u16) -> Result<()> {
        let personajes = &mut ctx.accounts.post.personajes;

        if let Some(personaje) = personajes.iter_mut().find(|p| p.nombre == nombre) {
            personaje.edad = edad;
            msg!("Edad actualizada para {} a {}", nombre, edad);
            Ok(())
        } else {
            Err(Errores::PersonajeNoEncontrado.into())
        }
    }
}

#[error_code]
pub enum Errores {
    #[msg("Error, revisa los campos, ya que algunos campos solo contienen espacios.")]
    LongitudNoEsperada,

    #[msg("Error, superpoder no encontrado")]
    SuperPoderNoEncontrado,

    #[msg("Error, no se encontró el personaje")]
    PersonajeNoEncontrado,

    #[msg("Error, espacio insuficiente para agregar personaje")]
    EspacioInsuficiente,

    #[msg("Error, no eres el propietario de la biblioteca que deseas modificar")]
    NoEresElOwner,
}

#[derive(InitSpace)] 
#[account]
pub struct Post {
    pub owner: Pubkey,

    #[max_len(60)]
    pub titulo_anime: String,

    #[max_len(25)]
    pub color_fondo: String,

    #[max_len(30)]
    pub autor: String,

    #[max_len(10)]
    pub personajes: Vec<Personaje>,
}

impl Post {
    // Constantes para manejo de espacio reservado
    pub const MAX_PERSONAJES: usize = 10;

    // Tamaño total estimado para el espacio reservado en la cuenta
    pub const SIZE: usize = 32 // Owner Pubkey
        + 4 + 60 // titulo_anime (string prefix + data)
        + 4 + 25 // color_fondo
        + 4 + 30 // autor
        + 4 + (Personaje::SIZE * Self::MAX_PERSONAJES); // vector length + personajes
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Debug, InitSpace)]
pub struct Personaje {
    #[max_len(60)]
    pub nombre: String,

    pub edad: u16,

    #[max_len(100)]
    pub descripcion: String,

    #[max_len(40)]
    pub superpoder: String,
}

impl Personaje {
    // Tamaño estimado para cada personaje
    pub const SIZE: usize =
        4 + 60 // nombre (string prefix + data)
        + 2 // edad u16
        + 4 + 100 // descripcion
        + 4 + 50; // superpoder (asumiendo max 50)
}

#[derive(Accounts)]
pub struct NuevoPost<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = Post::SIZE + 8, // 8 bytes para discriminator
        seeds = [b"posts", owner.key().as_ref()],
        bump
    )]
    pub post: Account<'info, Post>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct NuevoPersonaje<'info> {
    pub owner: Signer<'info>,

    #[account(mut)]
    pub post: Account<'info, Post>,
}
