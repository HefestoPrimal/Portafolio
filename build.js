// build.js
const fs = require('fs');
const path = require('path');

// Configuración
const projectsDir = './projects';
const outputFile = './projects-data.json';

// Extensiones de archivos soportados
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov'];

function buildProjectsData() {
    console.log('🔍 Escaneando carpetas de proyectos...');
    
    if (!fs.existsSync(projectsDir)) {
        console.error('❌ La carpeta "projects" no existe');
        return;
    }
    
    const projects = [];
    const items = fs.readdirSync(projectsDir);
    
    items.forEach(item => {
        const projectPath = path.join(projectsDir, item);
        
        if (fs.statSync(projectPath).isDirectory()) {
            console.log(`📁 Procesando proyecto: ${item}`);
            const project = processProject(item, projectPath);
            if (project) {
                projects.push(project);
                console.log(`   ✅ Proyecto agregado: ${project.titulo || item}`);
                console.log(`      📸 Imágenes encontradas: ${project.images.length}`);
                console.log(`      🎥 Videos encontrados: ${project.videos.length}`);
            }
        }
    });
    
    fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
    console.log(`\n✅ Archivo ${outputFile} generado con ${projects.length} proyectos`);
}

function processProject(folderName, projectPath) {
    try {
        // Inicializar proyecto con arrays vacíos
        let projectInfo = {
            name: folderName,
            titulo: folderName, // Valor por defecto
            descripcion: '',
            tecnologias: '',
            fecha: '',
            repositorio: '',
            demo: '',
            images: [],
            videos: []
        };
        
        // Leer info.txt si existe
        const infoPath = path.join(projectPath, 'info.txt');
        if (fs.existsSync(infoPath)) {
            const infoContent = fs.readFileSync(infoPath, 'utf8');
            const parsedInfo = parseInfoFile(infoContent);
            // Combinar la información manteniendo los arrays de imágenes y videos
            projectInfo = { ...projectInfo, ...parsedInfo, images: [], videos: [] };
        } else {
            console.log(`   ⚠️  No se encontró info.txt para ${folderName}`);
        }
        
        // Buscar imágenes - CORREGIDO: Asignar directamente al array
        const imagesDir = path.join(projectPath, 'imgs');
        if (fs.existsSync(imagesDir)) {
            const imageFiles = getFilesFromFolder(imagesDir, IMAGE_EXTENSIONS);
            projectInfo.images = imageFiles.map(file => 
                `projects/${folderName}/imgs/${file}`
            );
            console.log(`      📸 Archivos de imagen encontrados:`, imageFiles);
        }
        
        // Buscar videos - CORREGIDO: Asignar directamente al array
        const videosDir = path.join(projectPath, 'vids');
        if (fs.existsSync(videosDir)) {
            const videoFiles = getFilesFromFolder(videosDir, VIDEO_EXTENSIONS);
            projectInfo.videos = videoFiles.map(file => 
                `projects/${folderName}/vids/${file}`
            );
            console.log(`      🎥 Archivos de video encontrados:`, videoFiles);
        }
        
        return projectInfo;
        
    } catch (error) {
        console.error(`   ❌ Error procesando ${folderName}:`, error.message);
        return null;
    }
}

function parseInfoFile(content) {
    const info = {};
    
    content.split('\n').forEach(line => {
        if (!line.trim()) return;
        
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.substring(0, colonIndex).trim();
            const value = line.substring(colonIndex + 1).trim();
            
            if (key && value) {
                info[key] = value;
            }
        }
    });
    
    return info;
}

function getFilesFromFolder(folderPath, extensions) {
    if (!fs.existsSync(folderPath)) return [];
    
    return fs.readdirSync(folderPath)
        .filter(file => {
            const ext = path.extname(file).toLowerCase();
            return extensions.includes(ext);
        });
}

console.log('🚀 Iniciando generación del portafolio...\n');
buildProjectsData();