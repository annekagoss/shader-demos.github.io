#ifdef GL_ES
precision mediump float;
#endif

#define TAU 6.28318530718

uniform vec2 uResolution;
uniform float uTime;
uniform float uFrequency;
uniform float uSpeed;
uniform int uSignalType;

float amp = 1./3.;
float thickness = 0.1;

float signalLine(vec2 _st, float _signal1, float _signal2) {
	_signal1 *= amp;
	_signal2 *= amp;
		
	if (abs(_st.y - _signal1) < 0.005) {
		return 1.0;
	} else {
		if ((_st.y > _signal1 && _st.y < _signal2) ||
            (_st.y < _signal1 && _st.y > _signal2)) {
				return 1.0;
			}
		return 0.0;
	}
}

float signal(float time) {
	float freq = 440.0 * uFrequency;
	if (uSignalType == 0) {
		// Sine wave
		return sin(TAU * time * freq);
	} else if (uSignalType == 1) {
		// Square wave
		return step(fract(time * freq), 0.5)*2.0-1.0;
	} else if (uSignalType == 2) {
		// Sawtooth wave
		return fract(time * freq)*2.0-1.0;
	} else {
		// Triangle wave
		return abs(fract(time * freq) - 0.5) * 4.0 - 1.0;
	}
}

void main() {
	vec2 st = gl_FragCoord.xy/uResolution;
	st.x /= 256.0;
	st.y = st.y * 2.2 - 1.1;
	float timeOffset = uTime * uSpeed * -0.0000025;
	float value = signalLine(st, signal(st.x + timeOffset), signal(st.x + timeOffset - 0.00001));
	gl_FragColor = vec4(vec3(value), 1.0);
}