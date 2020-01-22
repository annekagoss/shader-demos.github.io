float circle(vec2 st, vec2 center, float radius) {
	float dist = distance(st, center);
	return smoothstep(dist - 0.0025, dist + 0.0025, radius);
}

#pragma glslify: export(circle)