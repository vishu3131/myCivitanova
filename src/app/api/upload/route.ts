import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file fornito' },
        { status: 400 }
      );
    }

    // Validazione del tipo di file
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Sono consentiti solo file immagine' },
        { status: 400 }
      );
    }

    // Validazione della dimensione (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Il file non può superare 5MB' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Crea directory uploads se non esiste
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    
    // Genera nome file unico
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const filename = `${timestamp}_${originalName}`;
    const path = join(uploadsDir, filename);

    // Ottimizza automaticamente l'immagine se è un'immagine
    let optimizedBuffer = buffer;
    let optimizedFilename = filename;
    
    if (file.type.startsWith('image/') && !file.type.includes('gif') && !file.type.includes('svg')) {
      try {
        // Ottimizza l'immagine
        optimizedBuffer = await sharp(buffer)
          .resize({
            width: 1200,
            height: 1200,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: 80 })
          .toBuffer();
        
        // Aggiorna il nome del file con estensione .webp
        optimizedFilename = filename.replace(/\.[^\.]+$/, '.webp');
        const optimizedPath = join(uploadsDir, optimizedFilename);
        await writeFile(optimizedPath, optimizedBuffer);
        
        // Elimina il file originale non ottimizzato
        await writeFile(path, buffer).catch(() => {});
        
      } catch (error) {
        console.warn('Ottimizzazione immagine fallita, usando file originale:', error);
        await writeFile(path, buffer);
      }
    } else {
      await writeFile(path, buffer);
    }

    // Restituisce l'URL pubblico del file
    const publicUrl = `/uploads/${optimizedFilename}`;

    return NextResponse.json({ 
      url: publicUrl,
      filename: filename,
      originalName: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { error: 'Errore interno del server durante il caricamento' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};