const canvas = document.getElementById('skybox');
const gl = canvas.getContext('webgl');

// Resize canvas on window resize
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

gl.clearColor(0.7, 0.8, 1.0, 1.0); // Light blue clear color
gl.clear(gl.COLOR_BUFFER_BIT);

// Vertex and fragment shaders
const vertexShaderSource = `
    attribute vec3 aPosition;
    varying vec3 vPosition;
    void main() {
        vPosition = aPosition;
        gl_Position = vec4(aPosition, 1.0);
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    varying vec3 vPosition;
    uniform samplerCube uSkybox;
    void main() {
        vec3 direction = normalize(vPosition);
        gl_FragColor = textureCube(uSkybox, direction);
    }
`;

function compileShader(source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
    }
    return shader;
}

const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);

// Cube vertices (the cube that wraps around the skybox texture)
const vertices = new Float32Array([
    -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1,
    -1, -1,  1, -1,  1,  1,  1,  1,  1,  1, -1,  1,
    -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
    -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
    -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1,
     1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1
]);

// Create and bind the buffer
const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLoc = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

// Create a texture for the skybox

// Cube faces and image sources
const faces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: 'panorama0.png' }, // +X face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: 'panorama1.png' }, // -X face
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: 'panorama2.png' }, // +Y face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: 'panorama3.png' }, // -Y face
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: 'panorama4.png' }, // +Z face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: 'panorama5.png' }  // -Z face
];

let loadedTextures = 0;
let texturesLoadedSuccessfully = 0;

// Function to load the images and check if all faces are loaded
faces.forEach((face) => {
    const image = new Image();
    image.onload = () => {
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        console.log(`Loaded: ${face.src}`);
        loadedTextures++;
        texturesLoadedSuccessfully++;

        // If all textures are loaded and valid, generate mipmaps and proceed
        if (loadedTextures === faces.length) {
            if (texturesLoadedSuccessfully === faces.length) {
                gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                console.log("Cube map textures loaded and mipmaps generated.");
            } else {
                console.error("Error: Not all cube map faces loaded correctly.");
            }
        }
    };
    image.onerror = () => {
        console.error(`Failed to load: ${face.src}`);
        loadedTextures++; // Count failed texture loading as done to avoid lockup
    };
    image.src = face.src;
});

// Set texture parameters
// Ensure the texture is bound properly before setting parameters
const skyboxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

// Correct texture parameters for cube map
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // Use LINEAR_MIPMAP_LINEAR for better mipmap filtering
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // Use LINEAR for magnification
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); // Clamp to edge for horizontal axis
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); // Clamp to edge for vertical axis
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); // Clamp to edge for depth axis

// Render loop
function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    requestAnimationFrame(render);
}
render();
