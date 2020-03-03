vec4 transformNormal(mat4 normalMatrix, vec3 vertexNormal) {
  return normalize(normalMatrix * vec4(vertexNormal, 1.));
}

float calculateSpecular(
	mat4 normalMatrix,
	vec3 vertexNormal,
	vec3 lighting,
	vec3 eye
) {
	vec4 n = transformNormal(normalMatrix, vertexNormal);
	// vec3 a = lightColorA * max(dot(n.xyz, normalize(lightPositionA)), 0.0);
	// vec3 b = lightColorB * max(dot(n.xyz, normalize(lightPositionB)), 0.0);
	// vec3 lighting = a + b;
	
	vec3 h = normalize(lighting + eye);
	// vec4 normal = normalize(transformNormal(normalMatrix, vertexNormal));
	//vec4 normal = normalize(transformNormal(normalMatrix, vertexNormal));
	float specularIntensity = max(dot(n.xyz, h), 0.0);
	//return 0.0;
	return max(pow(specularIntensity, 10.0), 0.0) * 1.0;
	//return max(dot(normal.xyz, h), 0.) * 10.0;
}

#pragma glslify: export(calculateSpecular)