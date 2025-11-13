// backend/routes/registros.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { OpenAI } = require('openai');
const { PERSONALIDAD_SUNNY, construirPromptDeRegistro } = require('../config/prompts.js');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.use(authMiddleware);

// --- PRIMERO: TODAS LAS RUTAS GET ESPECÍFICAS ---

// GET /today - REESCRITO SIN RPC
router.get('/today', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const clientTimezone = req.headers['x-client-timezone'] || 'UTC';
        const today = new Date().toLocaleDateString('en-CA', { timeZone: clientTimezone });

        const { data, error } = await req.supabase
            .from('registros')
            .select('*')
            .eq('profile_id', profileId)
            .gte('created_at', `${today}T00:00:00Z`)
            .lte('created_at', `${today}T23:59:59Z`)
            .order('created_at', { ascending: false })
            .limit(1);

        // Si hay un error REAL en la base de datos, lo lanzamos.
        if (error) throw error;
        
        const registroDeHoy = data && data.length > 0 ? data[0] : null;

        // SIEMPRE respondemos con 200 OK. La ausencia de datos se comunica con 'null'.
        res.status(200).json({ registro: registroDeHoy });

    } catch (err) {
        console.error("Error en GET /registros/today:", err.message);
        // Solo si hay un error catastrófico, devolvemos un 500.
        res.status(500).json({ error: 'Error al verificar el registro de hoy.' });
    }
});

// GET /historial - NUEVO ENDPOINT PARA EL TRACKING
router.get('/historial', async (req, res) => {
    try {
        const { id: profileId } = req.user;

        const { data, error } = await req.supabase
            .from('registros')
            .select('*') // Seleccionamos todos los campos
            .eq('profile_id', profileId)
            .order('created_at', { ascending: true }); // Ordenamos del más antiguo al más nuevo

        if (error) throw error;

        res.status(200).json(data);

    } catch (err) {
        console.error("Error en GET /registros/historial:", err.message);
        res.status(500).json({ error: 'Error al obtener el historial de registros.' });
    }
});

// GET /historial/resumen-semanal - REESCRITO CON LÓGICA JS
router.get('/historial/resumen-semanal', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const haceSieteDias = new Date();
        haceSieteDias.setDate(haceSieteDias.getDate() - 7);

        // 1. Traemos TODOS los registros de los últimos 7 días, del más nuevo al más viejo.
        const { data: todosLosRegistros, error } = await req.supabase
            .from('registros')
            .select('id, created_at, estado_general')
            .eq('profile_id', profileId)
            .gte('created_at', haceSieteDias.toISOString())
            .order('created_at', { ascending: false });

        if (error) throw error;

        // 2. Procesamos en JavaScript para quedarnos solo con el último de cada día.
        const ultimoPorDia = new Map();
        todosLosRegistros.forEach(registro => {
            const dia = new Date(registro.created_at).toDateString(); // Clave única para cada día
            if (!ultimoPorDia.has(dia)) {
                ultimoPorDia.set(dia, registro);
            }
        });
        
        // Convertimos el mapa de vuelta a un array y lo ordenamos de nuevo
        const resultadoFinal = Array.from(ultimoPorDia.values())
                                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.status(200).json(resultadoFinal);

    } catch (err) {
        console.error("Error en GET /historial/resumen-semanal:", err.message);
        res.status(500).json({ error: 'Error al obtener el resumen semanal.' });
    }
});

router.get('/check-existence', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        // Solo necesitamos saber si existe al menos UN registro.
        const { data, error } = await req.supabase
            .from('registros')
            .select('id')
            .eq('profile_id', profileId)
            .limit(1);

        if (error) throw error;

        // Si data tiene algo, significa que hay registros.
        res.status(200).json({ hasRecords: data && data.length > 0 });

    } catch (err) {
        console.error("Error en GET /check-existence:", err.message);
        res.status(500).json({ error: 'Error al verificar la existencia de registros.' });
    }
});

// GET /by-date/:date - NUEVO ENDPOINT PARA BUSCAR REGISTROS DE UN DÍA ESPECÍFICO
router.get('/by-date/:date', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { date } = req.params;

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return res.status(400).json({ error: 'Formato de fecha inválido. Usar YYYY-MM-DD.' });
        }

        // --- PASO 1: Obtener los registros del día (con sus metas principales) ---
        const { data: registros, error: registrosError } = await req.supabase
            .from('registros').select('*, metas ( * )').eq('profile_id', profileId)
            .gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
        if (registrosError) throw registrosError;

        // --- PASO 2: Obtener TODAS las metas de ese día ---
        const { data: metasDelDia, error: metasError } = await req.supabase
            .from('metas').select('*').eq('profile_id', profileId)
            .gte('created_at', `${date}T00:00:00.000Z`).lte('created_at', `${date}T23:59:59.999Z`);
        if (metasError) throw metasError;

        // --- PASO 3: Obtener las entradas del diario asociadas ---
        const registroIds = registros.map(r => r.id);
        const { data: diarios, error: diariosError } = await req.supabase
            .from('diario').select('*').in('registro_id', registroIds);
        if (diariosError) throw diariosError;
        const diariosMap = new Map(diarios.map(d => [d.registro_id, d]));

        // --- PASO 4: Unir todo ---
        const registrosCompletos = registros.map(registro => ({
            ...registro,
            diario: diariosMap.get(registro.id) || null,
            metasDelDia: metasDelDia || [], // Adjuntamos la lista completa de metas del día
        }));

        res.status(200).json(registrosCompletos);
    }
    catch (err) {
        console.error("Error en GET /registros/by-date:", err.message);
        res.status(500).json({ error: 'Error al obtener los registros de la fecha.' });
    }
});



router.get('/:id', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { id: registroId } = req.params;

        const { data, error } = await req.supabase
            .from('registros')
            .select('*, metas (*)') 
            .eq('profile_id', profileId) // Por seguridad, nos aseguramos que el registro sea del usuario.
            .eq('id', registroId) // Buscamos por el ID específico.
            .single(); // Esperamos solo un resultado.

        if (error) throw error;
        
        if (!data) {
            return res.status(404).json({ error: 'Registro no encontrado.' });
        }

        res.status(200).json(data);

    } catch (err) {
        console.error(`Error en GET /registros/${req.params.id}:`, err.message);
        res.status(500).json({ error: 'Error al obtener el registro.' });
    }
});


// POST / - ADAPTADO A LA NUEVA ESTRUCTURA
router.post('/', async (req, res) => {
    try {
        const { id: profileId } = req.user;
        const { mente_estado, mente_comentario, emocion_estado, emocion_comentario, cuerpo_estado, cuerpo_comentario, meta_descripcion } = req.body;

        // --- 1. Crear la Meta (Igual que antes) ---
        let metaPrincipalId = null;
        if (meta_descripcion && meta_descripcion.trim() !== '') {
            const { data: metaCreada, error: metaError } = await req.supabase
                .from('metas')
                .insert({ profile_id: profileId, descripcion: meta_descripcion })
                .select('id')
                .single();
            
            if (metaError) throw metaError;
            metaPrincipalId = metaCreada.id;
        }

        // --- 2. Calcular Estado General (Igual que antes) ---
        const menteNum = parseInt(mente_estado, 10);
        const emocionNum = parseInt(emocion_estado, 10);
        const cuerpoNum = parseInt(cuerpo_estado, 10);
        
        const avg = (menteNum + emocionNum + cuerpoNum) / 3;
        let estado_general = 'nublado';
        if (avg >= 66) estado_general = 'soleado';
        if (avg < 33) estado_general = 'lluvioso';

        // --- 3. Guardar el Registro INICIAL ---
        // (¡IMPORTANTE! Quitamos la columna 'frase_sunny')
        const { data: nuevoRegistro, error: registroError } = await req.supabase
            .from('registros')
            .insert({
                profile_id: profileId,
                mente_estado: menteNum,
                mente_comentario: mente_comentario,
                emocion_estado: emocionNum,
                emocion_comentario: emocion_comentario,
                cuerpo_estado: cuerpoNum,
                cuerpo_comentario: cuerpo_comentario,
                estado_general: estado_general,
                meta_principal_id: metaPrincipalId
                // Las 4 columnas de consejos (consejo_mente, etc.) están vacías por ahora
            })
            .select()
            .single();

        if (registroError) throw registroError;


        // --- 4. MARTILLAZO: La Nueva Lógica de IA ---
        // (Usamos los datos que acabamos de guardar)
        const promptDeTarea = construirPromptDeRegistro({
             // Bug corregido: pasamos los nombres correctos al prompt
            mente_estado: nuevoRegistro.mente_estado,
            mente_comentario: nuevoRegistro.mente_comentario,
            emocion_estado: nuevoRegistro.emocion_estado,
            emocion_comentario: nuevoRegistro.emocion_comentario,
            cuerpo_estado: nuevoRegistro.cuerpo_estado,
            cuerpo_comentario: nuevoRegistro.cuerpo_comentario,
            meta_descripcion: meta_descripcion // Pasamos la descripción de la meta
        });
        
        const completion = await openai.chat.completions.create({
            model: "gpt-4o", // O "gpt-3.5-turbo-1106"
            messages: [
                { role: "system", content: PERSONALIDAD_SUNNY },
                { role: "user", content: promptDeTarea }
            ],
            response_format: { type: "json_object" }, // Forzamos JSON
            max_tokens: 250,
        });
        
        const respuestaJson = completion.choices[0].message.content;
        const consejos = JSON.parse(respuestaJson); // { consejo_mente, ... }

        // --- 5. ACTUALIZAR el registro con los consejos ---
        // (Este es el "segundo guardado", ahora en las nuevas columnas)
        const { data: registroActualizado, error: updateError } = await req.supabase
            .from('registros')
            .update({ 
                consejo_mente: consejos.consejo_mente,
                consejo_emocion: consejos.consejo_emocion,
                consejo_cuerpo: consejos.consejo_cuerpo,
                frase_aliento: consejos.frase_aliento
            })
            .eq('id', nuevoRegistro.id)
            .select()
            .single();
        
        if (updateError) throw updateError;
        
        // 6. Devolvemos el registro final y actualizado al frontend
        res.status(201).json(registroActualizado);

    } catch (err) {
        console.error("Error al crear el registro:", err.message);
        res.status(500).json({ error: 'Error en el servidor al procesar el registro.' });
    }
});


// PUT /:id/hoja_atras - REESCRITO SIN RPC
router.put('/:id/hoja_atras', async (req, res) => {
    try {
        const { id: recordId } = req.params;
        const { id: profileId } = req.user;
        const { texto } = req.body;
        
        const { data, error } = await req.supabase
            .from('registros')
            .update({ hoja_atras: texto })
            .eq('id', Number(recordId))
            .eq('profile_id', profileId) // Doble chequeo de seguridad
            .select()
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Registro no encontrado o sin permiso.' });
        
        res.status(200).json({ message: 'Hoja de atrás guardada con éxito.', registro: data });
    } catch (err) {
        console.error("Error en PUT /:id/hoja_atras:", err.message);
        res.status(500).json({ error: 'Error interno al guardar la entrada.' });
    }
});

module.exports = router;