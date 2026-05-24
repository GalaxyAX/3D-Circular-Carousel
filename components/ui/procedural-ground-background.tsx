'use client';
import React, { useEffect, useRef } from 'react';

/**
 * ProceduralGroundBackground
 * A WebGL 2D background featuring topographic neon lines and sand-ripple movement.
 * Optimized for performance using fragment shaders.
 */
const ProceduralGroundBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) return;

    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      #ifdef GL_FRAGMENT_PRECISION_HIGH
        precision highp float;
      #else
        precision mediump float;
      #endif
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec3 u_baseColor;
      uniform vec3 u_accentColor;
      uniform vec3 u_neonColor;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
                   mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
        
        // Normal Floor Perspective: horizon is above the screen
        float depth = 1.0 / max(0.01, 1.5 - uv.y);
        vec2 gridUv = vec2(uv.x * depth, depth - u_time * 0.2);
        
        // Layered Procedural Noise for Terrain
        float n = noise(gridUv * 3.5);
        float ripples = sin(gridUv.y * 18.0 + n * 8.0 + u_time * 0.5);
        
        // Neon Topographic Lines
        float topoLine = smoothstep(0.03, 0.0, abs(ripples));
        
        // Composite
        vec3 finalColor = mix(u_baseColor, u_accentColor, n * 0.7 + 0.2);
        finalColor += topoLine * u_neonColor * depth * 0.8;
        
        // Radial vignette centered at the bottom to leave small dark edges
        vec2 radialUv = vec2(uv.x, uv.y + 1.0); 
        float vignette = smoothstep(3.0, 1.2, length(radialUv));
        
        // Fade out slowly towards the top horizon
        float topFade = smoothstep(1.5, 0.0, uv.y);
        
        finalColor *= vignette * topFade;

        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, createShader(gl, gl.VERTEX_SHADER, vsSource));
    gl.attachShader(program, createShader(gl, gl.FRAGMENT_SHADER, fsSource));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1, -1,  1,
      -1,  1,  1, -1,  1,  1
    ]), gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resLoc = gl.getUniformLocation(program, "u_resolution");
    const baseColorLoc = gl.getUniformLocation(program, "u_baseColor");
    const accentColorLoc = gl.getUniformLocation(program, "u_accentColor");
    const neonColorLoc = gl.getUniformLocation(program, "u_neonColor");

    const COLORS = [
      { base: [0.039, 0.031, 0.122], accent: [0.808, 0.133, 0.235], neon: [0.949, 0.690, 0.118] }, // IRON MAN
      { base: [0.039, 0.031, 0.122], accent: [0.043, 0.400, 0.063], neon: [0.820, 0.984, 0.843] }, // HULK
      { base: [0.039, 0.031, 0.122], accent: [0.820, 0.447, 0.118], neon: [0.984, 0.894, 0.690] }, // SPIDER
      { base: [0.039, 0.031, 0.122], accent: [0.341, 0.353, 0.325], neon: [0.635, 0.647, 0.620] }, // CAPTAIN
      { base: [0.039, 0.031, 0.122], accent: [0.090, 0.557, 0.675], neon: [0.835, 0.996, 0.996] }, // THOR
      { base: [0.039, 0.031, 0.122], accent: [0.224, 0.412, 0.431], neon: [0.584, 0.816, 0.769] }, // WIDOW
    ];

    let targetBase = COLORS[0].base;
    let targetAccent = COLORS[0].accent;
    let targetNeon = COLORS[0].neon;

    let currentBase = [...COLORS[0].base];
    let currentAccent = [...COLORS[0].accent];
    let currentNeon = [...COLORS[0].neon];

    const handleActiveChange = (e: Event) => {
      const idx = (e as CustomEvent).detail;
      if (COLORS[idx]) {
        targetBase = COLORS[idx].base;
        targetAccent = COLORS[idx].accent;
        targetNeon = COLORS[idx].neon;
      }
    };
    window.addEventListener('carousel-active-change', handleActiveChange);

    let animationFrameId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 16.666, 3);
      lastTime = time;

      const { innerWidth: width, innerHeight: height } = window;
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      // Smooth color transition
      const lerpSpeed = 0.03 * dt;
      for (let i = 0; i < 3; i++) {
        currentBase[i] += (targetBase[i] - currentBase[i]) * lerpSpeed;
        currentAccent[i] += (targetAccent[i] - currentAccent[i]) * lerpSpeed;
        currentNeon[i] += (targetNeon[i] - currentNeon[i]) * lerpSpeed;
      }

      gl.uniform1f(timeLoc, time * 0.001);
      gl.uniform2f(resLoc, width, height);
      gl.uniform3fv(baseColorLoc, currentBase);
      gl.uniform3fv(accentColorLoc, currentAccent);
      gl.uniform3fv(neonColorLoc, currentNeon);
      
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('carousel-active-change', handleActiveChange);
      cancelAnimationFrame(animationFrameId);
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      const loseContext = gl.getExtension('WEBGL_lose_context');
      if (loseContext) loseContext.loseContext();
    };
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full bg-zinc-950 z-0">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        style={{ filter: 'contrast(1.1) brightness(0.9)' }}
      />
    </div>
  );
};

export default ProceduralGroundBackground;
