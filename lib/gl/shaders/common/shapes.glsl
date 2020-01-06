float rectangle(vec2 st, vec2 dimensions){
	vec2 size = vec2(0.5) - dimensions*0.5;
	vec2 uv = smoothstep(size, size + vec2(0.005), st);
	uv *= smoothstep(size, size+vec2(0.005), vec2(1.0)-st);
	return uv.x * uv.y;
}
#pragma glslify: export(rectangle) 