/** @type {WebGLRenderingContext} */
/** @type {HTMLCanvasElement} */
// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
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
	var mvp = MatrixMult( projectionMatrix, rotTrans);
	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.program = InitShaderProgram(meshVS, meshFS);
		
		this.vertPos = gl.getAttribLocation(this.program, "vertPos");
		this.texAttrib = gl.getAttribLocation(this.program, "texAttrib")

		this.mvp = gl.getUniformLocation(this.program, "mvp");
		this.swap = gl.getUniformLocation(this.program, "isSwap");
		this.sampler = gl.getUniformLocation(this.program, "tex");
		this.show = gl.getUniformLocation(this.program, "isShow");
		
		this.vertBuffer = gl.createBuffer();
		this.texBuffer = gl.createBuffer();
		this.myTex = gl.createTexture();

		// [TO-DO] initializations
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		this.numTriangles = vertPos.length / 3;
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		
		// [TO-DO] Update the contents of the vertex buffer objects.
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
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		gl.useProgram(this.program);
		gl.uniformMatrix4fv(this.mvp, false, trans);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer);
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.vertPos)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer)
		gl.vertexAttribPointer(this.texAttrib, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.texAttrib);
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
	
}

// Vertex shader source code
var meshVS = `
	attribute vec3 vertPos;
	attribute vec2 texAttrib;
	uniform mat4 mvp;
	uniform int isSwap;
	varying vec2 texCoord;
	void main()
	{
		gl_Position = mvp * (isSwap == 1? vec4(vertPos.xzy, 1) : vec4(vertPos.xyz, 1));
		texCoord = texAttrib;
	}
`;
// Fragment shader source code
var meshFS = `
	precision mediump float;
	uniform sampler2D tex;
	uniform int isShow;
	varying vec2 texCoord;
	void main()
	{
		gl_FragColor = vec4(1, gl_FragCoord.z*gl_FragCoord.z, 0, 1);
		if(isShow == 1)
		{
			gl_FragColor = texture2D(tex, texCoord);
		}
	}
`;