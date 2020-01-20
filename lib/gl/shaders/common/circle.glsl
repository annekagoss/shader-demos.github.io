float circle(vec2 st, vec2 center, float radius) {
	float dist = distance(st, center);
	return smoothstep(dist - 0.005, dist, radius);
}

#pragma glslify: export(circle)