const vs = `
precision mediump float;

// default mandatory variables
attribute vec3 aVertexPosition;
attribute vec2 aTextureCoord;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

// our texture matrices
// displacement texture does not need to use them
uniform mat4 firstTextureMatrix;
uniform mat4 secondTextureMatrix;

// custom variables
varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vFirstTextureCoord;
varying vec2 vSecondTextureCoord;

// custom uniforms
uniform float uTransitionTimer;

void main() {
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);

    // varyings
    // use original texture coords for our displacement
    vTextureCoord = aTextureCoord;
    // use texture matrices for our videos
    vFirstTextureCoord = (firstTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vSecondTextureCoord = (secondTextureMatrix * vec4(aTextureCoord, 0.0, 1.0)).xy;
    vVertexPosition = aVertexPosition;
}
`;

const fs = `
precision mediump float;

varying vec3 vVertexPosition;
varying vec2 vTextureCoord;
varying vec2 vFirstTextureCoord;
varying vec2 vSecondTextureCoord;

// custom uniforms
uniform float uTransitionTimer;

// our textures samplers
// notice how it matches our data-sampler attributes
uniform sampler2D firstTexture;
uniform sampler2D secondTexture;
uniform sampler2D displacement;

void main() {
    // our displacement texture
    // i'll be using the fragment shader seen here : https://tympanus.net/codrops/2018/04/10/webgl-distortion-hover-effects/
    vec4 displacementTexture = texture2D(displacement, vTextureCoord);

    float displacementFactor = (cos(uTransitionTimer / (60.0 / 3.141592)) + 1.0) / 2.0;
    float effectFactor = 1.0;
    
    vec2 firstDisplacementCoords = vec2(vFirstTextureCoord.x - (1.0 - displacementFactor) * (displacementTexture.r * effectFactor), vFirstTextureCoord.y);
    vec2 secondDisplacementCoords = vec2(vSecondTextureCoord.x + displacementFactor * (displacementTexture.r * effectFactor), vSecondTextureCoord.y);

    vec4 firstDistortedColor = texture2D(firstTexture, firstDisplacementCoords);
    vec4 secondDistortedColor = texture2D(secondTexture, secondDisplacementCoords);

    vec4 finalColor = mix(secondDistortedColor, firstDistortedColor, displacementFactor);

    // handling premultiplied alpha
    finalColor = vec4(finalColor.rgb * finalColor.a, finalColor.a);

    gl_FragColor = finalColor;
}
`;
