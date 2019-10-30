precision mediump float;

attribute vec3 aVertexPosition;
// varying   vec3 vPosition;
void main() {
    gl_Position = vec4(aVertexPosition, 1.0);
    // vPosition = aVertexPosition;
}