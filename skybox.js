const canvas = document.getElementById('skybox');
const gl = canvas.getContext('webgl');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

gl.clearColor(0.7, 0.8, 1.0, 1.0); // Light blue clear color
gl.clear(gl.COLOR_BUFFER_BIT);

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

const vertices = new Float32Array([
    -1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1,
    -1, -1,  1, -1,  1,  1,  1,  1,  1,  1, -1,  1,
    -1,  1, -1, -1,  1,  1,  1,  1,  1,  1,  1, -1,
    -1, -1, -1,  1, -1, -1,  1, -1,  1, -1, -1,  1,
    -1, -1, -1, -1, -1,  1, -1,  1,  1, -1,  1, -1,
     1, -1, -1,  1,  1, -1,  1,  1,  1,  1, -1,  1
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLoc = gl.getAttribLocation(program, 'aPosition');
gl.enableVertexAttribArray(positionLoc);
gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);

const skyboxTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);

const faces = [
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, src: 'panorama0.png' },  // +X face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, src: 'panorama1.png' },  // -X face
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, src: 'panorama2.png' },  // +Y face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, src: 'panorama3.png' },  // -Y face
    { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, src: 'panorama4.png' },  // +Z face
    { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, src: 'panorama5.png' },  // -Z face
];

let loadedTextures = 0;

faces.forEach((face) => {
    const image = new Image();
    image.onload = () => {
        gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        console.log(`Loaded: ${face.src}`);
        loadedTextures++;
        
        // If all textures are loaded, generate mipmaps
        if (loadedTextures === faces.length) {
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
        }
    };
    image.onerror = () => {
        console.error(`Failed to load: ${face.src}`);
        loadedTextures++; // Count failed texture loading as done to avoid lockup
    };
    image.src = face.src;
});

// Set texture parameters
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 3);
    requestAnimationFrame(render);
}
render();
