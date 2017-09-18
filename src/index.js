import Regl from 'regl';

const regl = Regl();

// Calling regl() creates a new partially evaluated draw command
const draw = regl({
  frag: `
    #ifdef GL_ES
    precision mediump float;
    #endif
    
    #define PI 3.14159265359
    
    uniform vec2 u_resolution;
    uniform float u_time;
    
    vec3 colorA = vec3(0.149,0.141,0.912);
    vec3 colorB = vec3(1.000,0.833,0.224);
    
    float plot (vec2 st, float pct){
      return  smoothstep( pct-0.01, pct, st.y) - 
              smoothstep( pct, pct+0.01, st.y);
    }
    
    void main() {
        vec2 st = gl_FragCoord.xy/u_resolution.xy;
        vec3 color = vec3(0.0);
    
        vec3 pct = vec3(st.x);
        
        // pct.r = smoothstep(0.0,1.0, st.x);
        // pct.g = sin(st.x*PI);
        // pct.b = pow(st.x,0.5);
    
        color = mix(colorA, colorB, pct);
    
        // Plot transition lines for each channel
        color = mix(color,vec3(1.0,0.0,0.0),plot(st,pct.r));
        color = mix(color,vec3(0.0,1.0,0.0),plot(st,pct.g));
        color = mix(color,vec3(0.0,0.0,1.0),plot(st,pct.b));
    
        gl_FragColor = vec4(color,1.0);
    }
  `,

  vert: `
    precision mediump float;
    attribute vec2 position;
    uniform float angle;
    uniform vec2 offset;
    void main() {
      gl_Position = vec4(
        cos(angle) * position.x + sin(angle) * position.y + offset.x,
        -sin(angle) * position.x + cos(angle) * position.y + offset.y, 0, 1);
    }`,

  attributes: {
    position: [
      0.5, 0,
      0, 0.5,
      1, 1]
  },

  uniforms: {
    // the batchId parameter gives the index of the command
    color: ({tick}, props, batchId) => [
      Math.sin(0.02 * ((0.1 + Math.sin(batchId)) * tick + 3.0 * batchId)),
      Math.cos(0.02 * (0.02 * tick + 0.1 * batchId)),
      Math.sin(0.02 * ((0.3 + Math.cos(2.0 * batchId)) * tick + 0.8 * batchId)),
      1
    ],
    u_resolution: ({viewportHeight, viewportWidth}) => ({
      x: viewportWidth,
      y: viewportHeight,
    }),
    u_time: regl.context('time'),
    angle: ({tick}) => 0.01 * tick,
    offset: regl.prop('offset')
  },

  depth: {
    enable: false
  },

  count: 3
})

// Here we register a per-frame callback to draw the whole scene
regl.frame(function () {
  regl.clear({
    color: [0, 0, 0, 1]
  })

  // This tells regl to execute the command once for each object
  draw([
    { offset: [-1, -1] },
    { offset: [-1, 0] },
    { offset: [-1, 1] },
    { offset: [0, -1] },
    { offset: [0, 0] },
    { offset: [0, 1] },
    { offset: [1, -1] },
    { offset: [1, 0] },
    { offset: [1, 1] }
  ])
})
