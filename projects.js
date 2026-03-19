// projects.js
async function loadProjects() {
    const projectsContainer = document.getElementById('projects-container');
    
    // Limpiar el contenedor
    projectsContainer.innerHTML = '';
    
    try {
        // Intentar cargar un archivo JSON con los proyectos (recomendado)
        const response = await fetch('projects-data.json');
        
        if (response.ok) {
            // Si existe el JSON, lo usamos
            const projects = await response.json();
            projects.forEach(project => {
                const projectHTML = renderProject(project);
                projectsContainer.innerHTML += projectHTML;
            });
        } else {
            // Si no hay JSON, intentamos con el método de escaneo
            // Pero esto NO funcionará en GitHub Pages sin configuración adicional
            console.log('No se encontró projects-data.json');
            projectsContainer.innerHTML = '<p>No hay proyectos para mostrar</p>';
        }
    } catch (error) {
        console.error('Error cargando proyectos:', error);
        projectsContainer.innerHTML = '<p>Error cargando los proyectos</p>';
    }
}

function renderProject(project) {
    // Procesar imágenes
    const imagesHTML = project.images && project.images.length > 0 
        ? project.images.map(img => `
            <div class="media-item">
                <img src="${img}" alt="${project.titulo || project.name}">
            </div>
        `).join('')
        : '';

    // Procesar videos
    const videosHTML = project.videos && project.videos.length > 0
        ? project.videos.map(video => `
            <div class="media-item">
                <video controls>
                    <source src="${video}" type="video/mp4">
                    Tu navegador no soporta el elemento de video.
                </video>
            </div>
        `).join('')
        : '';

    return `
        <div class="project-card">
            <h2>${project.titulo || project.name}</h2>
            <p>${project.descripcion || 'Sin descripción'}</p>
            ${project.tecnologias ? `<p><strong>Tecnologías:</strong> ${project.tecnologias}</p>` : ''}
            ${project.fecha ? `<p><strong>Fecha:</strong> ${project.fecha}</p>` : ''}
            ${project.repositorio ? `<p><a href="${project.repositorio}" target="_blank" rel="noopener noreferrer">Repositorio</a></p>` : ''}
            ${project.demo ? `<p><a href="${project.demo}" target="_blank" rel="noopener noreferrer">Demostración</a></p>` : ''}
            
            ${imagesHTML || videosHTML ? `
                <div class="media-gallery">
                    ${imagesHTML}
                    ${videosHTML}
                </div>
            ` : ''}
        </div>
    `;
}

// Ejecutar cuando la página cargue
document.addEventListener('DOMContentLoaded', loadProjects);
