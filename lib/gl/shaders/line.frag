#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uThickness;

float plotLine(vec2 st){
  return  smoothstep( st.x-uThickness, st.x, st.y) -
          smoothstep( st.x, st.x+uThickness, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float value = plotLine(st);
	gl_FragColor = vec4(vec3(value), 1.0);
}