float SDFHexagram(vec2 _st, float radius )
{
	_st -= .5;
	_st.y *= -1.;
    const vec4 k = vec4(-0.5,0.8660254038,0.5773502692,1.7320508076);
    _st = abs(_st);
    _st -= 2.0*min(dot(k.xy,_st),0.0)*k.xy;
    _st -= 2.0*min(dot(k.yx,_st),0.0)*k.yx;
    _st -= vec2(clamp(_st.x,radius*k.z,radius*k.w),radius);
    return length(_st)*sign(_st.y);
}

#pragma glslify: export(SDFHexagram)