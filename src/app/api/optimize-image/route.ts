import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

interface OptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif';
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const options = JSON.parse(formData.get('options') as string || '{}') as OptimizationOptions;

    if (!file) {
      return NextResponse.json(
        { error: 'Nessun file immagine fornito' },
        { status: 400 }
      );
    }

    // Verifica il tipo di file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Tipo di file non supportato. Usa JPEG, PNG, WebP, AVIF o GIF' },
        { status: 400 }
      );
    }

    // Leggi il file in buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Configura le opzioni di default
    const optimizationOptions: OptimizationOptions = {
      width: options.width || 1200,
      height: options.height,
      quality: options.quality || 80,
      format: options.format || (file.type === 'image/png' ? 'png' : 'webp'),
    };

    // Ottimizza l'immagine
    let optimizedImage = sharp(buffer)
      .resize({
        width: optimizationOptions.width,
        height: optimizationOptions.height,
        fit: 'inside',
        withoutEnlargement: true,
      });

    // Applica le impostazioni di qualità in base al formato
    switch (optimizationOptions.format) {
      case 'jpeg':
        optimizedImage = optimizedImage.jpeg({ quality: optimizationOptions.quality });
        break;
      case 'png':
        optimizedImage = optimizedImage.png({ quality: optimizationOptions.quality });
        break;
      case 'webp':
        optimizedImage = optimizedImage.webp({ quality: optimizationOptions.quality });
        break;
      case 'avif':
        optimizedImage = optimizedImage.avif({ quality: optimizationOptions.quality });
        break;
    }

    // Genera l'immagine ottimizzata
    const optimizedBuffer = await optimizedImage.toBuffer();
    
    // Crea una directory per le immagini ottimizzate se non esiste
    const optimizedDir = path.join(process.cwd(), 'public', 'uploads', 'optimized');
    await fs.mkdir(optimizedDir, { recursive: true });

    // Genera un nome file unico
    const timestamp = Date.now();
    const originalName = file.name.replace(/\.[^\.]+$/, '');
    const optimizedFileName = `${originalName}_optimized_${timestamp}.${optimizationOptions.format}`;
    const optimizedFilePath = path.join(optimizedDir, optimizedFileName);

    // Salva l'immagine ottimizzata
    await fs.writeFile(optimizedFilePath, optimizedBuffer);

    // Calcola le statistiche di ottimizzazione
    const originalSize = buffer.length;
    const optimizedSize = optimizedBuffer.length;
    const sizeReduction = ((originalSize - optimizedSize) / originalSize) * 100;

    return NextResponse.json({
      success: true,
      optimizedUrl: `/uploads/optimized/${optimizedFileName}`,
      stats: {
        originalSize: originalSize,
        optimizedSize: optimizedSize,
        sizeReduction: Math.round(sizeReduction),
        format: optimizationOptions.format,
        dimensions: await sharp(optimizedBuffer).metadata().then(meta => ({
          width: meta.width,
          height: meta.height
        }))
      }
    });

  } catch (error) {
    console.error('Errore durante l\'ottimizzazione dell\'immagine:', error);
    return NextResponse.json(
      { error: 'Errore interno del server durante l\'ottimizzazione' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Endpoint di ottimizzazione immagini',
    supportedFormats: ['jpeg', 'png', 'webp', 'avif'],
    defaultOptions: {
      width: 1200,
      quality: 80,
      format: 'webp'
    }
  });
}