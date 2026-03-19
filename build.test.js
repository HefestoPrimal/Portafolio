// build.test.js
const fs = require('fs');
const path = require('path');
const {
    buildProjectsData,
    processProject,
    parseInfoFile,
    getFilesFromFolder,
    IMAGE_EXTENSIONS,
    VIDEO_EXTENSIONS
} = require('./build');

// Mock the fs module
jest.mock('fs');

describe('build.js - Portfolio Generator', () => {
    
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        // Mock console methods to avoid cluttering test output
        jest.spyOn(console, 'log').mockImplementation();
        jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
        // Restore console methods
        console.log.mockRestore();
        console.error.mockRestore();
    });

    describe('parseInfoFile', () => {
        
        test('Should parse info.txt file correctly and extract project metadata', () => {
            const content = `titulo: Test Project
descripcion: A test description
tecnologias: JavaScript, Node.js
fecha: 01/01/2024
github: github.com/test/repo
demo: example.com/demo`;

            const result = parseInfoFile(content);

            expect(result).toEqual({
                titulo: 'Test Project',
                descripcion: 'A test description',
                tecnologias: 'JavaScript, Node.js',
                fecha: '01/01/2024',
                github: 'github.com/test/repo',
                demo: 'example.com/demo'
            });
        });

        test('Should handle empty lines in info.txt file', () => {
            const content = `titulo: Test Project

descripcion: A test description

tecnologias: JavaScript`;

            const result = parseInfoFile(content);

            expect(result).toEqual({
                titulo: 'Test Project',
                descripcion: 'A test description',
                tecnologias: 'JavaScript'
            });
        });

        test('Should ignore lines without colons', () => {
            const content = `titulo: Test Project
This line has no colon
descripcion: A test description`;

            const result = parseInfoFile(content);

            expect(result).toEqual({
                titulo: 'Test Project',
                descripcion: 'A test description'
            });
        });

        test('Should handle lines with empty values', () => {
            const content = `titulo: Test Project
descripcion: 
tecnologias: JavaScript`;

            const result = parseInfoFile(content);

            expect(result).toEqual({
                titulo: 'Test Project',
                tecnologias: 'JavaScript'
            });
        });
    });

    describe('getFilesFromFolder', () => {
        
        test('Should filter files by supported image extensions only', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue([
                'image1.jpg',
                'image2.png',
                'document.pdf',
                'image3.gif',
                'script.js'
            ]);

            const result = getFilesFromFolder('/test/path', IMAGE_EXTENSIONS);

            expect(result).toEqual(['image1.jpg', 'image2.png', 'image3.gif']);
        });

        test('Should filter files by supported video extensions only', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue([
                'video1.mp4',
                'video2.webm',
                'image.jpg',
                'video3.mov',
                'audio.mp3'
            ]);

            const result = getFilesFromFolder('/test/path', VIDEO_EXTENSIONS);

            expect(result).toEqual(['video1.mp4', 'video2.webm', 'video3.mov']);
        });

        test('Should return empty array when folder does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            const result = getFilesFromFolder('/nonexistent/path', IMAGE_EXTENSIONS);

            expect(result).toEqual([]);
            expect(fs.readdirSync).not.toHaveBeenCalled();
        });

        test('Should handle case-insensitive file extensions', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue([
                'image1.JPG',
                'image2.PNG',
                'image3.GIF'
            ]);

            const result = getFilesFromFolder('/test/path', IMAGE_EXTENSIONS);

            expect(result).toEqual(['image1.JPG', 'image2.PNG', 'image3.GIF']);
        });
    });

    describe('processProject', () => {
        
        test('Should handle missing info.txt file gracefully with default values', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path.includes('info.txt')) return false;
                if (path.includes('imagenes')) return false;
                if (path.includes('videos')) return false;
                return true;
            });

            const result = processProject('TestProject', '/path/to/TestProject');

            expect(result).toEqual({
                name: 'TestProject',
                titulo: 'TestProject',
                descripcion: '',
                tecnologias: '',
                fecha: '',
                github: '',
                demo: '',
                images: [],
                videos: []
            });
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('No se encontró info.txt')
            );
        });

        test('Should collect image files from the imagenes folder with correct extensions', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path.includes('info.txt')) return false;
                if (path.includes('imagenes')) return true;
                if (path.includes('videos')) return false;
                return true;
            });
            fs.readdirSync.mockReturnValue(['photo1.jpg', 'photo2.png']);

            const result = processProject('TestProject', '/path/to/TestProject');

            expect(result.images).toEqual([
                '/projects/TestProject/imagenes/photo1.jpg',
                '/projects/TestProject/imagenes/photo2.png'
            ]);
        });

        test('Should collect video files from the videos folder with correct extensions', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path.includes('info.txt')) return false;
                if (path.includes('imagenes')) return false;
                if (path.includes('videos')) return true;
                return true;
            });
            fs.readdirSync.mockReturnValue(['demo.mp4', 'tutorial.webm']);

            const result = processProject('TestProject', '/path/to/TestProject');

            expect(result.videos).toEqual([
                '/projects/TestProject/videos/demo.mp4',
                '/projects/TestProject/videos/tutorial.webm'
            ]);
        });

        test('Should generate correct relative paths for images and videos', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path.includes('info.txt')) return true;
                if (path.includes('imagenes')) return true;
                if (path.includes('videos')) return true;
                return true;
            });
            fs.readFileSync.mockReturnValue('titulo: My Project');
            fs.readdirSync.mockImplementation((path) => {
                if (path.includes('imagenes')) return ['img.jpg'];
                if (path.includes('videos')) return ['vid.mp4'];
                return [];
            });

            const result = processProject('MyProject', '/path/to/MyProject');

            expect(result.images[0]).toBe('/projects/MyProject/imagenes/img.jpg');
            expect(result.videos[0]).toBe('/projects/MyProject/videos/vid.mp4');
        });

        test('Should return null when an error occurs during processing', () => {
            fs.existsSync.mockImplementation(() => {
                throw new Error('File system error');
            });

            const result = processProject('ErrorProject', '/path/to/ErrorProject');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalledWith(
                expect.stringContaining('Error procesando ErrorProject'),
                'File system error'
            );
        });
    });

    describe('buildProjectsData', () => {
        
        test('Should return early when the projects directory does not exist', () => {
            fs.existsSync.mockReturnValue(false);

            buildProjectsData();

            expect(console.error).toHaveBeenCalledWith(
                '❌ La carpeta "projects" no existe'
            );
            expect(fs.readdirSync).not.toHaveBeenCalled();
            expect(fs.writeFileSync).not.toHaveBeenCalled();
        });

        test('Should scan the projects directory and find all project folders', () => {
            fs.existsSync.mockReturnValue(true);
            fs.readdirSync.mockReturnValue(['Project1', 'Project2', 'file.txt']);
            fs.statSync.mockImplementation((path) => ({
                isDirectory: () => !path.includes('file.txt')
            }));

            buildProjectsData();

            expect(fs.readdirSync).toHaveBeenCalledWith('./projects');
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Procesando proyecto: Project1')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Procesando proyecto: Project2')
            );
        });

        test('Should write the final JSON output file with proper formatting', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path === './projects') return true;
                return false;
            });
            fs.readdirSync.mockReturnValue(['Project1']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            buildProjectsData();

            expect(fs.writeFileSync).toHaveBeenCalledWith(
                './projects-data.json',
                expect.stringContaining('"name": "Project1"')
            );
            expect(console.log).toHaveBeenCalledWith(
                expect.stringContaining('Archivo ./projects-data.json generado con 1 proyectos')
            );
        });

        test('Should skip null projects returned by processProject', () => {
            fs.existsSync.mockImplementation((path) => {
                if (path === './projects') return true;
                throw new Error('Mock error');
            });
            fs.readdirSync.mockReturnValue(['ErrorProject']);
            fs.statSync.mockReturnValue({ isDirectory: () => true });

            buildProjectsData();

            const writeCall = fs.writeFileSync.mock.calls[0];
            const jsonData = JSON.parse(writeCall[1]);
            
            expect(jsonData).toEqual([]);
        });
    });
});
