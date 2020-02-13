#ifdef GL_ES
precision mediump float;
#endif

varying vec3 vLighting;

uniform vec2 uResolution;
uniform int uMaterialType;

void main() {  
	if (uMaterialType == 0) {
		gl_FragColor = vec4(vLighting, 1.0);
		return;
	}
	
	vec2 st = gl_FragCoord.xy/uResolution;
	gl_FragColor = vec4(st.x, st.y, 0.5, 1.0);
}