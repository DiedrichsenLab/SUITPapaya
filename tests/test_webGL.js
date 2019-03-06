let vertexShaderText =
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
        '  gl_PointSize = 2.0;',
        '}'
    ].join('\n');

let fragmentShaderText =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '  gl_FragColor = vec4(fragColor, 1.0);',
        '}'
    ].join('\n');

let fragmentShaderText_1 =
    [
        'precision mediump float;',
        '',
        'varying vec3 fragColor;',
        'void main()',
        '{',
        '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);',
        '}'
    ].join('\n');

let InitDemo = function () {
    console.log('This is working');

    let canvas = document.getElementById('flatmap-surface');
    let gl = canvas.getContext('webgl');

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
    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    let fragmentShader_1 = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderText);
    gl.shaderSource(fragmentShader, fragmentShaderText);
    gl.shaderSource(fragmentShader_1, fragmentShaderText_1);

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

    gl.compileShader(fragmentShader_1);
    if (!gl.getShaderParameter(fragmentShader_1, gl.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader_1));
        return;
    }

    let program = gl.createProgram();
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

    // Create the test program
    let program_1 = gl.createProgram();
    gl.attachShader(program_1, vertexShader);
    gl.attachShader(program_1, fragmentShader_1);
    gl.linkProgram(program_1);
    if (!gl.getProgramParameter(program_1, gl.LINK_STATUS)) {
        console.error('ERROR linking program!', gl.getProgramInfoLog(program_1));
        return;
    }
    gl.validateProgram(program_1);
    if (!gl.getProgramParameter(program_1, gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', gl.getProgramInfoLog(program_1));
        return;
    }

    // ------------ Load flatmap vertices information and transfer to array -------------//
    let triangleVertices = [];
    $.ajax({
        url: "../tests/data/flatmap_vertices.csv",
        async: false,
        success: function (csvd) {
            let triangleData = $.csv.toArrays(csvd);
            //let triangleVertices = [];

            for (let i = 0; i < triangleData.length; i++) {
                triangleVertices.push(triangleData[i][0] / 100);
                triangleVertices.push(triangleData[i][1] / 100);
            }
        }
    });

    console.log(triangleVertices);

    // ------------ Load flatmap border information and transfer to array -------------//
    let border = [];
    $.ajax({
        url: "../tests/data/flatmap_border.csv",
        async: false,
        success: function (csvd) {
            let borderData = $.csv.toArrays(csvd);
            for (let i = 0; i < borderData.length; i++) {
                border.push(borderData[i][0] / 100);
                border.push(borderData[i][1] / 100);
                border.push(0.0);
                border.push(0.0);
                border.push(0.0);
            }
        }
    });

    console.log(border);

    // ------------ Load flatmap edges information and transfer to array -------------//
    let triangleIndex = [];
    $.ajax({
        url: "../tests/data/flatmap_edges.csv",
        async: false,
        success: function (csvd) {
            let edgeData = $.csv.toArrays(csvd);
            for (let i = 0; i < edgeData.length; i++) {
                triangleIndex.push(edgeData[i][0] - 1);
                triangleIndex.push(edgeData[i][1] - 1);
                triangleIndex.push(edgeData[i][2] - 1);
            }
        }
    });

    console.log(triangleIndex);

    // ------------ Load jet-colormap -------------//
    let colormap = [];
    $.ajax({
        url: "../tests/data/jet_colormap.csv",
        async: false,
        success: function (csvd) {
            colormap = $.csv.toArrays(csvd);
        }
    });

    console.log(colormap);

    // ------------ Load vertices color information -------------//
    let verticesColor = [];
    $.ajax({
        url: "../tests/data/flatmap_verticesColor.csv",
        async: false,
        success: function (csvd) {
            verticesColor = $.csv.toArrays(csvd);
        }
    });

    console.log(verticesColor);

    // ------------ Load flatmap edges COLOR information and transfer to array -------------//
    let indices = [];
    for (let x in verticesColor) {
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

    let indices_color = [];
    indices_color.push([indices[0][0], indices[0][1], colormap[0][0], colormap[0][1], colormap[0][2]]);
    colormap.shift();

    for (let i = 1; i < indices.length; i++) {
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

    // To Change: Set threshold to filter the middle range
    let upper = 0.1;
    let lower = -0.1;

    for (let i = 0; i < indices_color.length; i++) {
        if (!isNaN(indices_color[i][0])){
            if(indices_color[i][0] >= lower && indices_color[i][0] <= upper) {
                indices_color[i][2] = 0.9;
                indices_color[i][3] = 0.9;
                indices_color[i][4] = 0.9;
            }
        }
    }

    let pos = 2;
    let interval = 5;

    while (pos < triangleVertices.length) {
        triangleVertices.splice(pos, 0, indices_color[0][2], indices_color[0][3], indices_color[0][4]);
        indices_color.shift();
        pos += interval;
    }

    triangleVertices.push(indices_color[0][2], indices_color[0][3], indices_color[0][4]);


    // ------------------------------------- Draw flatmap --------------------------------------//
    gl.useProgram(program);
    // triangle vertex buffer object
    const triangleVertexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);

    // Triangle Index buffer object
    const triangleIndexBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBufferObject);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleIndex), gl.STATIC_DRAW);


    const positionAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        positionAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );
    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(positionAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main render loop
    // gl.useProgram(program);
    gl.drawElements(gl.TRIANGLES, triangleIndex.length, gl.UNSIGNED_SHORT, 0);


    // ------------------------------------- Draw Borders --------------------------------------//
    gl.useProgram(program);
    // Border buffer object
    const borderBufferObject = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, borderBufferObject);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(border), gl.STATIC_DRAW);

    const borderAttribLocation = gl.getAttribLocation(program, 'vertPosition');
    //const colorAttribLocation = gl.getAttribLocation(program, 'vertColor');

    gl.vertexAttribPointer(
        borderAttribLocation, // Attribute location
        2, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        0 // Offset from the beginning of a single vertex to this attribute
    );

    gl.vertexAttribPointer(
        colorAttribLocation, // Attribute location
        3, // Number of elements per attribute
        gl.FLOAT, // Type of elements
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, // Size of an individual vertex
        2 * Float32Array.BYTES_PER_ELEMENT // Offset from the beginning of a single vertex to this attribute
    );

    gl.enableVertexAttribArray(borderAttribLocation);
    gl.enableVertexAttribArray(colorAttribLocation);

    // Main render loop
    //gl.useProgram(program);
    gl.drawArrays(gl.POINTS, 0, border.length/5);
};