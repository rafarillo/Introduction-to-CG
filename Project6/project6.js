var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	vec3 viewDir = normalize(view - position);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		Ray shadowRay;
		shadowRay.pos = position;
		shadowRay.dir = normalize(lights[i].position - position);
		HitInfo hit;
		bool isIntersecting = IntersectRay(hit, shadowRay);
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
		if(!isIntersecting)
		{
			vec3 h = normalize(shadowRay.dir + viewDir);
			color += mtl.k_d * lights[i].intensity * 0.05;	// change this line
			color += lights[i].intensity * (max(0.0, dot(shadowRay.dir, normal))* mtl.k_d + pow(max(0.0, dot(h, normal)), mtl.n) * mtl.k_s);
		}
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	for ( int i=0; i<NUM_SPHERES; ++i ) {
		float a = dot(ray.dir, ray.dir);
		float b = 2.0 * dot(ray.dir, ray.pos - spheres[i].center);
		float c = dot(ray.pos - spheres[i].center, ray.pos - spheres[i].center) - spheres[i].radius * spheres[i].radius;

		float delta = (b * b) - (4.0 * a * c);
		if(delta >= 0.0)
		{
			
			float t = (-b - sqrt(delta))/(2.0 * a);
			if(t >= 1e-3 && t <= hit.t)
			{
				foundHit = true;
				hit.t = t;
				hit.position = ray.pos + hit.t * ray.dir;
				hit.normal = normalize(2.0 * (hit.position - spheres[i].center));
				hit.mtl = spheres[i].mtl;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			r.pos = hit.position;
			r.dir = normalize(2.0 * dot(view, hit.normal)*hit.normal - view);
			// TO-DO: Initialize the reflection ray
			
			if ( IntersectRay( h, r ) ) {
				view = normalize(-r.dir);
				k_s = h.mtl.k_s;
				hit = h;
				clr += Shade(h.mtl, h.position, h.normal, view);
				// TO-DO: Hit found, so shade the hit point
				// TO-DO: Update the loop variables for tracing the next reflection ray
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;