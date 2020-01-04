#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
// uniform vec2 uRectDimensions;

float rectangle(vec2 st){
	float width = 0.3;
	float height = 0.3;
	float hOffset = (1.0 - width) / 2.0;
	float vOffset = (1.0 - height) / 2.0;
	
  	return step(hOffset, 1.0 - st.x) * 
	  	   step(hOffset, st.x) * 
		   step(vOffset, 1.0 - st.y) * 
		   step(vOffset, st.y);
}

void main() {
    vec2 st = gl_FragCoord.xy/uResolution;
	float value = rectangle(st);
	gl_FragColor = vec4(vec3(value), 1.0);
}