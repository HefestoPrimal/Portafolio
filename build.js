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
    
    // Verificar si la carpeta projects existe
    if (!fs.existsSync(projectsDir)) {
        console.error('❌ La carpeta "projects" no existe');
        return;
    }
    
    const projects = [];
    
    // Leer todas las carpetas en projects/
    const items = fs.readdirSync(projectsDir);
    
    items.forEach(item => {
        const projectPath = path.join(projectsDir, item);
        
        // Solo procesar carpetas
        if (fs.statSync(projectPath).isDirectory()) {
            console.log(`📁 Procesando proyecto: ${item}`);
            
            const project = processProject(item, projectPath);
            if (project) {
                projects.push(project);
                console.log(`   ✅ Proyecto agregado: ${project.titulo || item}`);
            }
        }
    });
    
    // Guardar el archivo JSON
    fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
    console.log(`\n✅ Archivo ${outputFile} generado con ${projects.length} proyectos`);
}

function processProject(folderName, projectPath) {
    try {
        // Leer info.txt si existe
        const infoPath = path.join(projectPath, 'info.txt');
        let projectInfo = {
            name: folderName,
            images: [],
            videos: []
        };
        
        if (fs.existsSync(infoPath)) {
            const infoContent = fs.readFileSync(infoPath, 'utf8');
            projectInfo = { ...projectInfo, ...parseInfoFile(infoContent) };
        } else {
            console.log(`   ⚠️  No se encontró info.txt para ${folderName}`);
        }
        
        // Buscar imágenes
        const imagesDir = path.join(projectPath, 'imagenes');
        if (fs.existsSync(imagesDir)) {
            projectInfo.images = getFilesFromFolder(imagesDir, IMAGE_EXTENSIONS)
                .map(file => `/projects/${folderName}/imagenes/${file}`);
        }
        
        // Buscar videos
        const videosDir = path.join(projectPath, 'videos');
        if (fs.existsSync(videosDir)) {
            projectInfo.videos = getFilesFromFolder(videosDir, VIDEO_EXTENSIONS)
                .map(file => `/projects/${folderName}/videos/${file}`);
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
        // Ignorar líneas vacías
        if (!line.trim()) return;
        
        // Buscar el primer ":" para separar clave y valor
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

// Ejecutar el script
console.log('🚀 Iniciando generación del portafolio...\n');
buildProjectsData();
