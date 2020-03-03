vec4 transformNormal(mat4 normalMatrix, vec3 vertexNormal) {
  return normalize(normalMatrix * vec4(vertexNormal, 1.));
}

float calculateSpecular(
	mat4 normalMatrix,
	vec3 vertexNormal,
	vec3 lighting,
	vec3 eye,
	float intensity
) {
	vec4 normal = transformNormal(normalMatrix, vertexNormal);
	vec3 h = normalize(lighting + eye);
	float specularIntensity = max(dot(normal.xyz, h), 0.0);
	return max(pow(specularIntensity, 20.0), 0.0) * intensity;
}

#pragma glslify: export(calculateSpecular)