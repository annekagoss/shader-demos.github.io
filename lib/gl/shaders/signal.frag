#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 uResolution;
uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;
uniform int uSignalType;

float amp = .3;
float thickness = 0.1;

float signalLine(vec2 _st, float _signal) {
	_st = _st * 2. - 1.;
	_signal = _signal - .5;
	return smoothstep(_signal-thickness-0.01, _signal-thickness+0.01, _st.y/amp) -
          smoothstep(_signal+thickness-0.01, _signal+thickness+0.01, _st.y/amp);
}

float signal(vec2 st) {
	float phase = uTime * -0.001 * uSpeed;
	float sinewave = sin(st.x * uFrequency + phase) * .5 + .5;
	if (uSignalType == 0) {
		return sinewave;
	} else if (uSignalType == 1) {
		return step(1. - sinewave, .5);
	} 
	else {
		return fract(st.x*(uFrequency*0.25)+(phase*0.25));
	}
}

void main() {
	vec2 st = gl_FragCoord.xy/uResolution;
	float value = signalLine(st, signal(st));
	gl_FragColor = vec4(vec3(value), 1.0);
}