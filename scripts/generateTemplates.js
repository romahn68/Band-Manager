import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const templatesDir = path.join(process.cwd(), 'public', 'templates');

if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true });
}

// 1. Template: Songs
const songData = [
    {
        'Título': 'Ejemplo de Canción',
        'Tonalidad': 'G Major',
        'Letra': 'Letra de la canción...',
        'Acordes': 'G - C - D',
        'Código': 'SNG-001'
    }
];
const songWS = XLSX.utils.json_to_sheet(songData);
const songWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(songWB, songWS, 'Canciones');
XLSX.writeFile(songWB, path.join(templatesDir, 'Plantilla_Canciones.xlsx'));

// 2. Template: Gear/Inventory
const gearData = [
    {
        'Nombre': 'Guitarra Eléctrica',
        'Categoría': 'Instrumento',
        'Propietario': 'Juan Pérez',
        'Notas': 'Fender Stratocaster Roja',
        'Código': 'GR-001'
    }
];
const gearWS = XLSX.utils.json_to_sheet(gearData);
const gearWB = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(gearWB, gearWS, 'Inventario');
XLSX.writeFile(gearWB, path.join(templatesDir, 'Plantilla_Inventario.xlsx'));

console.log('¡Plantillas generadas con éxito en public/templates/!');
