vec3 calculateLighting(
	mat4 modelViewMatrix, 
	vec3 vertexNormal, 
	vec3 lightPositionA,
	vec3 lightPositionB,
	vec3 lightColorA, 
	vec3 lightColorB
) {
	vec4 normal = normalize(modelViewMatrix * vec4(vertexNormal, 1.));
	vec3 a = lightColorA * max(dot(normal.xyz, normalize(lightPositionA)), 0.0);
	vec3 b = lightColorB * max(dot(normal.xyz, normalize(lightPositionB)), 0.0);
	return a + b;
}

#pragma glslify: export(calculateLighting)