var vertexShaderText =
    [
        'precision mediump float;',
        '',
        'attribute vec2 vertPosition;',
        'attribute vec3 vertColor;',
        'varying vec3 fragColor;',
        '',
        'void main()',
        '{',
        '  fragColor = vertColor;',
        '  gl_Position = vec4(vertPosition, 0.0, 1.0);',
        '}'
    ].join('\n');

var fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n');


var InitDemo = function () {
    console.log('This is working');

    var canvas = document.getElementById('flatmap-surface');
    var gl = canvas.getContext('webgl');

    if (!gl) {
        console.log('WebGL not supported, falling back on experimental-webgl');
        gl = canvas.getContext('experimental-webgl');
    }

    if (!gl) {
        alert('Your browser does not support WebGL');
    }

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    //
    // Create shaders
    //
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
        return;
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program));
        return;
    }
    gl.validateProgram(program);
    if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program));
        return;
    }

    // Test adding stride
    // var triangleVertices_test = [0.0, 0.5, -0.5, -0.5, 0.5, -0.5];
    // pos = 2;
    // interval = 5;
    //
    // while (pos < triangleVertices_test.length) {
    //     triangleVertices_test.splice(pos, 0, Math.random().toFixed(1), Math.random().toFixed(1), Math.random().toFixed(1));
    //     pos += interval;
    // }
    //
    // triangleVertices_test.push(Math.random().toFixed(1), Math.random().toFixed(1), Math.random().toFixed(1));
    // console.log(triangleVertices_test);

    // ------------ Load flatmap vertices information and transfer to array -------------//
    $.ajax({
        url: "../tests/data/flatmap_vertices.csv",
        async: false,
        success: function (csvd) {
            triangleData = $.csv.toArrays(csvd);
        }
    });

    console.log(triangleData);
    var triangleVertices1 = [];

    for (var i = 0; i < triangleData.length; i++) {
        triangleVertices1.push(triangleData[i][0] / 100);
        triangleVertices1.push(triangleData[i][1] / 100);
    }
    console.log(triangleVertices1);

    // ------------ Load flatmap edges information and transfer to array -------------//
    $.ajax({
        url: "../tests/data/flatmap_edges.csv",
        async: false,
        success: function (csvd) {
            edgeData = $.csv.toArrays(csvd);
        }
    });

    console.log(edgeData);
    var triangleIndex1 = [];

    for (var i = 0; i < edgeData.length; i++) {
        triangleIndex1.push(edgeData[i][0] - 1);
        triangleIndex1.push(edgeData[i][1] - 1);
        triangleIndex1.push(edgeData[i][2] - 1);
    }
    console.log(triangleIndex1);

    // ------------ Load jet-colormap -------------//
    $.ajax({
        url: "../tests/data/jet_colormap.csv",
        async: false,
        success: function (csvd) {
            colormap = $.csv.toArrays(csvd);
        }
    });

    console.log(colormap);

    // ------------ Load vertices color information -------------//
    $.ajax({
        url: "../tests/data/flatmap_verticesColor.csv",
        async: false,
        success: function (csvd) {
            verticesColor = $.csv.toArrays(csvd);
        }
    });

    console.log(verticesColor);
    // var triangleIndex1 = [];
    //
    // for (var i = 0; i < edgeData.length; i++) {
    //     triangleIndex1.push(edgeData[i][0] - 1);
    //     triangleIndex1.push(edgeData[i][1] - 1);
    //     triangleIndex1.push(edgeData[i][2] - 1);
    // }
    // console.log(triangleIndex1);

    // ------------ Load flatmap edges COLOR information and transfer to array -------------//
    // var input = [0, 3, 2, 2, 6, 5, NaN];
    // var colormap = [[0.0, 0.0, 0.5625],
    //                 [0.0, 0.0, 0.6250],
    //                 [0.0, 0.0, 0.6875],
    //                 [0.0, 0.0, 0.7500],
    //                 [0.0, 0.0, 0.8125]];

    var indices = [];
    for (var x in verticesColor) {
        indices.push([verticesColor[x][0], x]);
    }
    indices.sort(function (a, b) {
        if( !isFinite(a[0]) && !isFinite(b[0]) ) {
            return 0;
        }
        if( !isFinite(a[0]) ) {
            return 1;
        }
        if( !isFinite(b[0]) ) {
            return -1;
        }
        return a[0]-b[0];
        //return a[0] - b[0];
    });

    var count = 0;
    for (var i = 0; i < indices.length; i++) {
        if (isNaN(indices[i][0])) {
            count += 1;
            console.log(i);
        }
    }

    console.log(count);
    console.log(indices);
    console.log(colormap[0][0]);

    var indices_color = [];
    indices_color.push([indices[0][0], indices[0][1], colormap[0][0], colormap[0][1], colormap[0][2]]);
    colormap.shift();

    for (var i = 1; i < indices.length; i++) {
        if (isNaN(indices[i][0])) {
            indices_color.push([indices[i][0], indices[i][1], 0.9, 0.9, 0.9]);
        }
        else{
            if (indices[i][0] === indices[i-1][0]) {
                indices_color.push([indices[i][0], indices[i][1], indices_color[i-1][2], indices_color[i-1][3], indices_color[i-1][4]]);
            }
            else{
                indices_color.push([indices[i][0], indices[i][1], colormap[0][0], colormap[0][1], colormap[0][2]]);
                colormap.shift();
            }
        }
    }
    console.log(indices_color);

    indices_color.sort(function (a, b) {
        return a[1] - b[1];
    });
    // for (var i = 0; i < indices_color.length; i++){
    //     console.log(indices_color[i][2] + " " + indices_color[i][3] + " " + indices_color[i][4] + '\n');
    // }
    //console.log(indices_color);

    // Set threshold
    var upper = 1.0;
    var lower = -0.1;

    for (var i = 0; i < indices_color.length; i++) {
        if (!isNaN(indices_color[i][0])){
            if(indices_color[i][0] >= lower && indices_color[i][0] <= upper) {
                indices_color[i][2] = 0.0;
                indices_color[i][3] = 0.0;
                indices_color[i][4] = 0.0;
            }
        }
    }

    //var triangleVertices = [0.0, 0.5, -0.5, -0.5, 0.5, -0.5];
    pos = 2;
    interval = 5;

    while (pos < triangleVertices1.length) {
        triangleVertices1.splice(pos, 0, indices_color[0][2], indices_color[0][3], indices_color[0][4]);
        indices_color.shift();
        pos += interval;
    }

    triangleVertices1.push(indices_color[0][2], indices_color[0][3], indices_color[0][4]);

    // triangle vertex buffer object
    const triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices1), gl.STATIC_DRAW);

    // Triangle Index buffer object
    const triangleIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndex1), gl.STATIC_DRAW);

    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        gl.FALSE,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    //
    // Main render loop
    //
    gl.useProgram(program);
    gl.drawElements(gl.TRIANGLES, triangleIndex1.length, gl.UNSIGNED_SHORT, 0);
};