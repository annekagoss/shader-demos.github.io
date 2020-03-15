vec4 toonShading(
	vec3 eye,
	vec4 normalDirection,
	vec4 vertexPosition,
	vec3 lightPosition,
	vec3 baseColor
) {
	vec3 viewDirection = normalize(eye - vertexPosition.xyz);
	vec3 lightDirection = normalize(lightPosition);
	
	float lambert = dot(normalDirection.xyz, lightDirection);
	float halfLambert = 0.5 * lambert + 0.5;
	float toon = 
		0.5 * smoothstep(.5, .51, lambert) + 0.5 + 
		0.5 * smoothstep(0.5, 0.51, halfLambert) + 0.5;
	float outline = smoothstep(0.2, 0.21, normalDirection.z);
	vec3 fragmentColor = outline * toon * baseColor;
	
	bool lightSourceOnRightSide = pow(max(0.0, dot(reflect(-lightDirection, normalDirection.xyz), viewDirection)),10.0) > 0.8;
	if (lambert > 0.0 && lightSourceOnRightSide) {
		fragmentColor = vec3(1);
	}
	
	return vec4(fragmentColor, 1.0);
}

#pragma glslify: export(toonShading)