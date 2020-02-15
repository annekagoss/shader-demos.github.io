float rectangle(vec2 st, vec2 dimensions, vec2 resolution){
	float aspect = resolution.x/resolution.y;
	st.x *= aspect;
	dimensions.x /= aspect;
	vec2 size = vec2(0.5) - dimensions*.5;
	size.x *= aspect;
	vec2 origin = vec2(1.0);
	origin.x *= aspect;
	vec2 uv = smoothstep(size, size + vec2(0.005), st);
	uv *= smoothstep(size, size+vec2(0.005), origin-st);
	return uv.x * uv.y;
}
#pragma glslify: export(rectangle) 