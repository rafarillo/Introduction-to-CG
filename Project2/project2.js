// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform( positionX, positionY, rotation, scale )
{
	let translationMatrix = new Array(1, 0, 0, 0, 1, 0, positionX, positionY, 1); 
	let rotationMatrix = new Array(Math.cos(rotation*Math.PI/180), Math.sin(rotation*Math.PI/180), 0, -Math.sin(rotation*Math.PI/180), Math.cos(rotation*Math.PI/180), 0, 0, 0, 1);
	let scaleMatrix = new Array(scale, 0, 0, 0, scale, 0, 0, 0, 1);
	let rotationXscale = MultiplyMatrix(rotationMatrix, scaleMatrix);
	return MultiplyMatrix(translationMatrix, rotationXscale);
	return Array( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
function ApplyTransform( trans1, trans2 )
{
	return MultiplyMatrix(trans2, trans1);
	return Array( 1, 0, 0, 0, 1, 0, 0, 0, 1 );
}

function MultiplyMatrix(M1, M2)
{
	const a1 = M1[0] * M2[0] + M1[3] * M2[1] + M1[6] * M2[2];
	const a2 = M1[0] * M2[3] + M1[3] * M2[4] + M1[6] * M2[5];
	const a3 = M1[0] * M2[6] + M1[3] * M2[7] + M1[6] * M2[8];

	const a4 = M1[1] * M2[0] + M1[4] * M2[1] + M1[7] * M2[2];
	const a5 = M1[1] * M2[3] + M1[4] * M2[4] + M1[7] * M2[6];
	const a6 = M1[1] * M2[6] + M1[4] * M2[7] + M1[7] * M2[8];

	const a7 = M1[2] * M2[0] + M1[5] * M2[1] + M1[8] * M2[2];
	const a8 = M1[2] * M2[3] + M1[5] * M2[4] + M1[8] * M2[5];
	const a9 = M1[2] * M2[6] + M1[5] * M2[7] + M1[8] * M2[8];
	return new Array(a1, a4, a7, a2, a5, a8, a3, a6, a9);
}