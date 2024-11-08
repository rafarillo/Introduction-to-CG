// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];

	let cosX = Math.cos(rotationX);
	let sinX = Math.sin(rotationX);
	var rotX = [
		1, 0, 0, 0,
		0, cosX, sinX, 0,
		0, -sinX, cosX, 0,
		0, 0, 0, 1, 
	];

	var cosY = Math.cos(rotationY);
	var sinY = Math.sin(rotationY);
	var rotY = [
		cosY, 0, -sinY, 0,
		0, 1, 0, 0,
		sinY, 0, cosY, 0,
		0, 0, 0, 1
	];

	var rot = MatrixMult(rotY, rotX);
	var rotTrans = MatrixMult(trans, rot)
	return rotTrans;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.program = InitShaderProgram(meshVS, meshFS);
		
		this.vertPos = gl.getAttribLocation(this.program, "vertPos");
		this.texAttrib = gl.getAttribLocation(this.program, "texAttrib");
		this.normalAttrib = gl.getAttribLocation(this.program, "normalAttrib");

		this.mvp = gl.getUniformLocation(this.program, "mvp");
		this.swap = gl.getUniformLocation(this.program, "isSwap");
		this.sampler = gl.getUniformLocation(this.program, "tex");
		this.show = gl.getUniformLocation(this.program, "isShow");

		this.mv = gl.getUniformLocation(this.program, "mv");
		this.normalMatrix = gl.getUniformLocation(this.program, "normalMatrix");
		this.lightDir = gl.getUniformLocation(this.program, "lightDir");
		this.shininess = gl.getUniformLocation(this.program, "shininess");

		this.vertBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.normalBuffer = gl.createBuffer();
		this.myTex = gl.createTexture();
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		gl.useProgram(this.program);
		gl.uniform1i(this.swap, Number(swap));
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.program);
		gl.uniformMatrix4fv(this.mvp, false, matrixMVP);

		gl.uniformMatrix4fv(this.mv, false, matrixMV);
		gl.uniformMatrix3fv(this.normalMatrix, false, matrixNormal);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer)
		gl.vertexAttribPointer(this.texAttrib, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texAttrib);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.vertexAttribPointer(this.normalAttrib, 3,gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.normalAttrib);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture

		// You can set the texture image data using the following command.
		gl.bindTexture(gl.TEXTURE_2D, this.myTex);
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap(gl.TEXTURE_2D);
		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MAG_FILTER,
			gl.LINEAR
		)

		gl.texParameteri(
			gl.TEXTURE_2D,
			gl.TEXTURE_MIN_FILTER,
			gl.LINEAR_MIPMAP_LINEAR
		)

		gl.activeTexture(gl.TEXTURE0);
		gl.useProgram(this.program);
		gl.bindTexture(gl.TEXTURE_2D, this.myTex);
		gl.uniform1i(this.sampler, 0);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		gl.useProgram(this.program);
		gl.uniform1i(this.show, Number(show));
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.program);
		gl.uniform3f(this.lightDir, x, y, z);
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		gl.useProgram(this.program);
		gl.uniform1f(this.shininess, shininess);
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
	}
}

// Vertex shader source code
var meshVS = `
	attribute vec3 vertPos;
	attribute vec2 texAttrib;
	attribute vec3 normalAttrib;

	uniform mat4 mvp;
	uniform int isSwap;
	
	uniform mat4 mv;
	uniform mat3 normalMatrix;

	varying vec2 texCoord;
	varying vec3 normal;
	void main()
	{
		vec3 normalMV = normalMatrix * normalAttrib;
		vec4 posMV = mv * vec4(vertPos, 1);
		// Both coordiantes in in the model view space we can shade now

		gl_Position = mvp * (isSwap == 1? vec4(vertPos.xzy, 1) : vec4(vertPos.xyz, 1));
		
		texCoord = texAttrib;
		normal = normalMV;
	}
`;
// Fragment shader source code
var meshFS = `
	precision mediump float;
	uniform sampler2D tex;
	uniform int isShow;

	uniform vec3 lightDir;
	uniform float shininess;

	vec3 I = vec3(1.0, 1.0, 1.0);
	vec3 Ks = vec3(1.0, 1.0, 1.0);

	varying vec2 texCoord;
	varying vec3 normal;
	void main()
	{
		vec4 Kd = vec4(1.0, 1.0, 1.0, 1.0);
		if(isShow == 1)
		{
			Kd = texture2D(tex, texCoord);
		}
		vec3 normLightDir = normalize(lightDir);
		// Consider the camera as zero vector
		vec3 h = normLightDir;
		float cosTheta = dot(normLightDir, normal);
		float cosPhi = dot(normal, h);

		gl_FragColor = vec4(I * (cosTheta * Kd.xyz + Ks * pow(cosPhi, shininess)) , 1.0);
	}
`;
