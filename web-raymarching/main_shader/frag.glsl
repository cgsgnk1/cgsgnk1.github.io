#version 300 es
/* NK1 */
precision highp float;

/* Finalize color */
out vec4 fColor;

/* Some math defines */
#define matrIdentity mat4(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1)
#define pi 3.14159265359

/* Shape data structure */
struct ShapeData {
  vec4 ambientType;   /* Ambient & type of shape */
  vec4 diffuseTrans;  /* Diffuse & transparency */
  vec4 specularPhong; /* Specular & phong coefficient */  
  vec4 addon[5];      /* Addon shape data */
}; /* End of 'ShapeData' structure */

/* Data about ray position structure */
struct mapResult {
  float minDistance; /* Minimum distance to objects */
  int shapeIndex;    /* Index in shape array */ 
}; /* End of 'mapResult' function */

#define MAX_SHAPES 64

/* Timer buffer */
layout(std140) uniform timerUBO {
  vec4 sync;               /* Time & global time, delta time & global delta time */
}; /* End of 'timerUBO' uniform */

/* Camera buffer */
layout(std140) uniform cameraUBO {
  vec4 camLocFrameW;       /* Camera location & frame width */
  vec4 camDirFrameH;       /* Camera direction & frame height */
  vec4 camAtProjDist;      /* Camera point of interest & projection distance */
  vec4 camRightAngleY;     /* Camera right & rotate Y angle */
  vec4 camUpAngleXZ;       /* Camera up & rotate angle */
  mat4 matrView;           /* View matrix */
  mat4 matrProj;           /* Projection matrix */
  mat4 matrVP;             /* View * projection matrix */
}; /* End of 'cameraUBO' uniform */
/* Most of upper data is not usable [yet :)] */

/* Shapes buffer */
layout(std140) uniform shapesUBO {
  ShapeData shapeData[MAX_SHAPES]; /* Shapes data array */
}; /* End of 'shapesUBO' uniform */

/* Rotate around Y axis function.
 * ARGUMENTS:
 *   - angle of rotate:
 *       float angle;
 * RETURNS:
 *   (mat4) result matrix.
 */
mat4 matrRotateY(float angle) {
  mat4 res = matrIdentity;

  float a = angle * pi / 180.0, s = sin(a), c = cos(a);

  res[0][0] = c;
  res[0][2] = -s;
  res[2][0] = s;
  res[2][2] = c;

  return res;
} /* End of 'matrRotateY' function */

/* Rotate around random axis function.
 * ARGUMENTS:
 *   - axis vector:
 *       vec3 v;
 *   - angle of rotate:
 *       float angle;
 * RETURNS:
 *   (mat4) result matrix.
 */
mat4 matrRotate(vec3 v, float angle) {
  float a = angle * pi / 180.0, s = sin(a), c = cos(a);
  vec3 r = normalize(v);
  mat4 res;
  
  res[0][0] = c + r.x * r.x * (1.0 - c);
  res[0][1] = r.x * r.y * (1.0 - c) + r.z * s;
  res[0][2] = r.x * r.z * (1.0 - c) - r.y * s;
  res[0][3] = 0.0;

  res[1][0] = r.y * r.x * (1.0 - c) - r.z * s;
  res[1][1] = c + r.y * r.y * (1.0 - c);
  res[1][2] = r.y * r.z * (1.0 - c) + r.x * s;
  res[1][3] = 0.0;

  res[2][0] = r.z * r.x * (1.0 - c) + r.y * s;
  res[2][1] = r.z * r.y * (1.0 - c) - r.x * s;
  res[2][2] = c + r.z * r.z * (1.0 - c);
  res[2][3] = 0.0;

  res[3][0] = 0.0;
  res[3][1] = 0.0;
  res[3][2] = 0.0;
  res[3][3] = 1.0;
  
  return res;
} /* End of 'matrRotate' function */

#define camLoc camLocFrameW.xyz
#define frameW camLocFrameW.w
#define camDir camDirFrameH.xyz
#define frameH camDirFrameH.w
#define camAt camAtProjDist.xyz
#define projDist camAtProjDist.w
#define angleY camRightAngleY.w
#define angleXZ camUpAngleXZ.w

#define shape(shapeIndex) shapeData[shapeIndex]

#define ambient ambientType.xyz
#define type ambientType.w
#define diffuse diffuseTrans.xyz
#define trans diffuseTrans.w
#define specular specularPhong.xyz
#define phong specularPhong.w

#define syncTime sync.x
#define syncGlobalTime sync.y
#define syncDeltaDime sync.z
#define syncGlobalDeltaDime sync.w

/* Evaluate distance from sphere function.
 * ARGUMENTS:
 *   - position on ray:
 *       vec3 p;
 *   - center of sphere:
 *       vec3 c;
 *   - radius of sphere:
 *       float r;
 * RETURNS:
 *   (float) distance result.
 */
float distanceFromSphere(vec3 p, vec3 c, float r) {
  return length(p - c) - r;
} /* End of 'distanceFromSphere' function */

/* Evaluate distance from plane function.
 * ARGUMENTS:
 *   - position on ray:
 *       vec3 p;
 *   - point on plane:
 *       vec3 pp;
 *   - plane normal:
 *       vec3 n;
 * RETURNS:
 *   (float) distance result.
 */
float distanceFromPlane(vec3 p, vec3 pp, vec3 n) {
  vec3 v = p - pp;
  n = normalize(n);
  float cox = abs(dot(n, v) / length(v));

  return length(v) * cox;
} /* End of 'distanceFromPlane' function */

/* Evaluate distance from box function.
 * ARGUMENTS:
 *   - position on ray:
 *       vec3 p;
 *   - box center:
 *       vec3 c;
 *   - size of 1/4 box:
 *       vec3 b;
 * RETURNS:
 *   (float) distance result.
 */
float distanceFromBox(vec3 p, vec3 c, vec3 b) {
  p -= c;

  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
} /* End of 'distanceFromBox' function */

/* Evaluate distance from torus function.
 * ARGUMENTS:
 *   - position on ray:
 *       vec3 p;
 *   - center:
 *       vec3 c;
 *   - radiuses:
 *       vec2 t;
 * RETURNS:
 *   (float) distance result.
 */
float distanceFromTorus(vec3 p, vec3 c, vec2 t)
{
  p -= c;
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
} /* End of 'distanceFromTorus' function */

/* Map scene from given position function.
 * ARGUMENTS:
 *   - position on ray:
 *       vec3 p;
 * RETURNS:
 *   (mapResult) result of map.
 */
mapResult mapTheWorld(vec3 p) {
  float displacement = sin(5.0 * p.x) * sin(5.0 * p.y) * sin(5.0 * p.z) * 0.25;
  displacement = 0.0;
//  displacement = 0.0;
//  float sphere_0 = distance_from_sphere(p, vec3(0.0), 1.0);
  float sphere_0 = 0.0;
  float sphere_1 = distanceFromSphere(p, vec3(1.0), 1.5);
  float sphere_2 = distanceFromSphere(p, vec3(-2.0, 0.0, 2.0), 2.0);

  // return min(min(sphere_0, sphere_1), sphere_2) + displacement;
  mapResult res;
  res.minDistance = 10000.0;
  res.shapeIndex = -1;

  //res.minDistance = torus_0;
  //res.shapeIndex = 0;

  //return res;  
  int i;

  for (i = 0; i < MAX_SHAPES; i++) {
    float shapeType = shape(i).type;

    if (shapeType == 0.0)
      break;
    

    float d = 0.0;
    if (shapeType == 1.0) {
      d = distanceFromSphere(p, shape(i).addon[0].xyz, shape(i).addon[0].w);
    } else if (shapeType == 2.0) {
      d = distanceFromPlane(p, shape(i).addon[0].xyz, shape(i).addon[1].xyz);
    } else if (shapeType == 3.0) {
      d = distanceFromBox(p, shape(i).addon[0].xyz, shape(i).addon[1].xyz);
    } else if (shapeType == 4.0) {
      d = distanceFromTorus(p, shape(i).addon[0].xyz, shape(i).addon[1].xy);
    }
    if (d < res.minDistance) {
      res.minDistance = d, res.shapeIndex = i;
    }
  }

  res.minDistance += displacement;
  return res;
} /* End of 'mapTheWorld' function */

/* Calculate normal in point function.
 * ARGUMENTS:
 *   - position on surface:
 *       vec3 p;
 * RETURNS:
 *   (vec3) normal result.
 */
vec3 calculateNormal(in vec3 p) {
  const vec3 small_step = vec3(0.00001, 0.0, 0.0);

  float gradient_x = mapTheWorld(p + small_step.xyy).minDistance - mapTheWorld(p - small_step.xyy).minDistance;
  float gradient_y = mapTheWorld(p + small_step.yxy).minDistance - mapTheWorld(p - small_step.yxy).minDistance;
  float gradient_z = mapTheWorld(p + small_step.yyx).minDistance - mapTheWorld(p - small_step.yyx).minDistance;

  vec3 normal = vec3(gradient_x, gradient_y, gradient_z);

  return normalize(normal);
} /* End of 'calculateNormal' function */

/* Shade position function.
 * ARGUMENTS: 
 *   - position to shade:
 *       vec3 p;
 *   - shape index in shape array:
 *       int shapeIndex;
 * RETURNS:
 *  (vec3) color result.
 */
vec3 shade(vec3 p, int shapeIndex) {
  vec3 l = normalize(vec3(2.0, 5.0, 3.0));
  vec3 n = calculateNormal(p);
  vec3 v = normalize(p - camLoc);

  vec3 ka = shape(shapeIndex).ambient;
  vec3 kd = shape(shapeIndex).diffuse;
  vec3 ks = shape(shapeIndex).specular;
  float tr = shape(shapeIndex).trans;
  float ph = shape(shapeIndex).phong;
  float shapeType = shape(shapeIndex).type;

  vec3 color = ka;

  n = faceforward(n, v, n);
      
  // return shapeData[mapped.shapeIndex].colorType.xyz * diffuse_intensity  * normalize(vec3(abs(tanh(exp(current_position.y)) * sin(current_position.x * 10.0)), 1.0, abs(8.0 * sin(current_position.z * 10.0))));//* 1.0 / length(current_position - light_position);// * diffuse_intensity;
  // return shapeData[mapped.shapeIndex].colorType.xyz * diffuse_intensity * fract(3.5 * sin(0.02 * length(current_position.xz)));

  if (shapeType == 2.0 && shape(shapeIndex).addon[1].w != 1.0) {
    // diffuse_intensity *= sin(1000.0 * tanh(cosh(current_position.z * current_position.x)));
    if (((int(p.x * 2.0) ^ int(p.y * 2.0 + 0.03) ^ int(p.z * 2.0)) & int(1.0)) != 1) {
      kd *= cos(abs(sin(syncTime / 100000.0)) * 200.0  * tanh(cosh(p.z * p.x)));
    }
  }

  color += max(0.0, dot(n, l)) * kd; 

  vec3 r = reflect(v, n);
  color += pow(max(0.0, dot(r, l)), ph) * ks;

  return color;
} /* End of 'shade' function */

/* Ray travel function.
 * ARGUMENTS:
 *   - ray org:
 *       vec3 ro;
 *   - ray dir:
 *       vec3 rd;
 * RETURNS:
 *   (vec3) color result.
 */
vec3 rayMarch(in vec3 ro, in vec3 rd) {
  float total_distance_traveled = 0.0;
  const int NUMBER_OF_STEPS = 96;
  const float MAXIMUM_TRACE_DISTANCE = 10000.0;
  const float SMALL_FLOAT = 0.0001;
  const int NUMBER_OF_REFLECTS = 5;

  int numOfRef = 0;
  vec3 colorDefault = vec3(0);

  for (int i = 0; i < NUMBER_OF_STEPS; ++i) {
    vec3 current_position = ro + total_distance_traveled * rd;

    mapResult mapped = mapTheWorld(current_position);

    if (mapped.minDistance < SMALL_FLOAT) {
      return shade(current_position, mapped.shapeIndex) * 1.0 / pow(length(current_position), 0.67);
    }

    if (total_distance_traveled > MAXIMUM_TRACE_DISTANCE) {
      break;
    }
    total_distance_traveled += mapped.minDistance;
  }
  return vec3(0.0);
} /* End of 'rayMarch' function */

/* Fragment shader enter point function.
 * ARGUMENTS: None.
 * RETURNS: None.
 */
void main(void) {
  // vec2 uv = vUV.st * 2.0 - 1.0;
  vec2 uv = vec2(-1.0, -1.0) + 2.0 * gl_FragCoord.xy / max(frameW, frameH);

  vec3 rd = vec3(uv.x, uv.y, 1.0);
  rd *= mat3(matrRotate(vec3(0, 1, 0), -angleY));
  rd *= mat3(matrRotate(vec3(-camDir.z, 0, camDir.x), -angleXZ));
  rd = normalize(rd);
  vec3 ro = camLoc;// vec3(sin(syncTime / 10000.0) * 10.0, 0.0, sin(syncTime / 10000.0) * 10.0);

  vec3 shaded_color = rayMarch(ro, rd);

  fColor = vec4(shaded_color, 1.0);
} /* End of 'main' function */
