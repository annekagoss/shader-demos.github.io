#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	gl_FragColor = vec4(st.x, 0.0, st.y, 1.0);
}