import React, { useEffect, useRef, useState } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  indices: number[];
  type: "blade" | "guard" | "hilt" | "pommel" | "gem";
  baseColor: { r: number; g: number; b: number };
}

// 3D vertices of a masterfully crafted medieval silver dagger
const DAGGER_VERTICES: Point3D[] = [
  // Blade (Tip to base)
  { x: 0, y: 120, z: 0 },     // 0: Tip of the blade
  { x: 0, y: 25, z: 7 },      // 1: Front central ridge (upper)
  { x: -11, y: 25, z: 0 },    // 2: Left edge (upper)
  { x: 11, y: 25, z: 0 },     // 3: Right edge (upper)
  { x: 0, y: 25, z: -7 },     // 4: Back central ridge (upper)
  
  { x: 0, y: -10, z: 6 },     // 5: Front central ridge (lower)
  { x: -9, y: -10, z: 0 },    // 6: Left edge (lower)
  { x: 9, y: -10, z: 0 },     // 7: Right edge (lower)
  { x: 0, y: -10, z: -6 },    // 8: Back central ridge (lower)

  // Crossguard (Silver wing guards)
  { x: -28, y: -10, z: 4 },   // 9: Left guard tip front
  { x: -28, y: -10, z: -4 },  // 10: Left guard tip back
  { x: -32, y: -16, z: 0 },   // 11: Left guard extreme wing
  { x: 28, y: -10, z: 4 },    // 12: Right guard tip front
  { x: 28, y: -10, z: -4 },   // 13: Right guard tip back
  { x: 32, y: -16, z: 0 },    // 14: Right guard extreme wing
  { x: 0, y: -16, z: 8 },     // 15: Guard center bulge front
  { x: 0, y: -16, z: -8 },    // 16: Guard center bulge back

  // Hilt/Grip (Wire-wrapped silver grip)
  { x: -5, y: -16, z: 4 },    // 17: Grip top front-left
  { x: 5, y: -16, z: 4 },     // 18: Grip top front-right
  { x: 5, y: -16, z: -4 },    // 19: Grip top back-right
  { x: -5, y: -16, z: -4 },   // 20: Grip top back-left
  { x: -4, y: -50, z: 3.5 },  // 21: Grip bottom front-left
  { x: 4, y: -50, z: 3.5 },   // 22: Grip bottom front-right
  { x: 4, y: -50, z: -3.5 },  // 23: Grip bottom back-right
  { x: -4, y: -50, z: -3.5 }, // 24: Grip bottom back-left

  // Pommel (Polished silver crown with inset blood gem)
  { x: 0, y: -64, z: 0 },     // 25: Pommel bottom tip
  { x: -7, y: -56, z: 0 },    // 26: Pommel left bulge
  { x: 7, y: -56, z: 0 },     // 27: Pommel right bulge
  { x: 0, y: -56, z: 7 },     // 28: Pommel front bulge
  { x: 0, y: -56, z: -7 },    // 29: Pommel back bulge

  // Inset Crimson Soul Gem on Pommel
  { x: 0, y: -56, z: 8.5 },   // 30: Gem front center peak
  { x: -3, y: -56, z: 6 },    // 31: Gem left
  { x: 3, y: -56, z: 6 },     // 32: Gem right
  { x: 0, y: -59, z: 6 },     // 33: Gem bottom
  { x: 0, y: -53, z: 6 }      // 34: Gem top
];

// Silver/chrome bases, and golden accents for the hilt pommel and guard.
// Let's color-code them:
// Blade: Bright reflective silver {r: 210, g: 215, b: 225}
// Guard/Hilt/Pommel: Imperial dark steel/gold trim {r: 180, g: 155, b: 90} or bright silver {r: 230, g: 230, b: 235}
// Gem: Glistening crimson {r: 210, g: 30, b: 40}
const DAGGER_FACES: Face[] = [
  // --- Blade Upper Front ---
  { indices: [0, 1, 2], type: "blade", baseColor: { r: 215, g: 220, b: 228 } },
  { indices: [0, 3, 1], type: "blade", baseColor: { r: 235, g: 240, b: 245 } }, // slightly brighter side
  // --- Blade Upper Back ---
  { indices: [0, 2, 4], type: "blade", baseColor: { r: 195, g: 200, b: 208 } },
  { indices: [0, 4, 3], type: "blade", baseColor: { r: 185, g: 190, b: 198 } },

  // --- Blade Lower Front ---
  { indices: [1, 5, 6, 2], type: "blade", baseColor: { r: 210, g: 215, b: 223 } },
  { indices: [3, 7, 5, 1], type: "blade", baseColor: { r: 230, g: 235, b: 242 } },
  // --- Blade Lower Back ---
  { indices: [2, 6, 8, 4], type: "blade", baseColor: { r: 190, g: 195, b: 203 } },
  { indices: [4, 8, 7, 3], type: "blade", baseColor: { r: 180, g: 185, b: 193 } },

  // --- Crossguard Front Left ---
  { indices: [6, 11, 9], type: "guard", baseColor: { r: 220, g: 200, b: 140 } }, // Gold trim
  { indices: [9, 11, 15], type: "guard", baseColor: { r: 240, g: 220, b: 160 } },
  // --- Crossguard Front Right ---
  { indices: [7, 12, 14], type: "guard", baseColor: { r: 220, g: 200, b: 140 } },
  { indices: [12, 15, 14], type: "guard", baseColor: { r: 240, g: 220, b: 160 } },
  // --- Crossguard Back Left ---
  { indices: [8, 10, 11], type: "guard", baseColor: { r: 190, g: 170, b: 110 } },
  { indices: [10, 16, 11], type: "guard", baseColor: { r: 180, g: 160, b: 100 } },
  // --- Crossguard Back Right ---
  { indices: [8, 14, 13], type: "guard", baseColor: { r: 190, g: 170, b: 110 } },
  { indices: [13, 14, 16], type: "guard", baseColor: { r: 180, g: 160, b: 100 } },

  // --- Grip Front ---
  { indices: [17, 18, 22, 21], type: "hilt", baseColor: { r: 40, g: 45, b: 55 } }, // dark leather wrap
  // --- Grip Back ---
  { indices: [19, 20, 24, 23], type: "hilt", baseColor: { r: 30, g: 35, b: 42 } },
  // --- Grip Sides ---
  { indices: [18, 19, 23, 22], type: "hilt", baseColor: { r: 35, g: 40, b: 48 } },
  { indices: [20, 17, 21, 24], type: "hilt", baseColor: { r: 35, g: 40, b: 48 } },

  // --- Pommel Bulges & Sides (Engraved silver) ---
  { indices: [21, 22, 27, 26], type: "pommel", baseColor: { r: 200, g: 205, b: 215 } },
  { indices: [26, 27, 25], type: "pommel", baseColor: { r: 180, g: 185, b: 195 } },
  { indices: [26, 28, 25], type: "pommel", baseColor: { r: 210, g: 215, b: 225 } },
  { indices: [27, 25, 28], type: "pommel", baseColor: { r: 220, g: 225, b: 235 } },
  { indices: [26, 25, 29], type: "pommel", baseColor: { r: 160, g: 165, b: 175 } },
  { indices: [27, 29, 25], type: "pommel", baseColor: { r: 170, g: 175, b: 185 } },

  // --- Crimson Soul Gem (Pommel center) ---
  { indices: [30, 31, 33], type: "gem", baseColor: { r: 230, g: 20, b: 35 } },
  { indices: [30, 33, 32], type: "gem", baseColor: { r: 255, g: 45, b: 65 } },
  { indices: [30, 32, 34], type: "gem", baseColor: { r: 240, g: 30, b: 45 } },
  { indices: [30, 34, 31], type: "gem", baseColor: { r: 200, g: 10, b: 25 } }
];

interface DaggerInstance {
  x: number;          // screen % x
  y: number;          // screen % y
  z: number;          // deep distance factor (for scale and opacity)
  scale: number;      // scale factor
  rx: number;         // current rotation X
  ry: number;         // current rotation Y
  rz: number;         // current rotation Z
  spinSpeedX: number; // rotational speeds
  spinSpeedY: number;
  spinSpeedZ: number;
  driftX: number;     // linear movement speeds
  driftY: number;
  glintTimer: number; // timer for sparkle animation
  glintPos: { x: number; y: number } | null;
}

export const Dagger3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instancesRef = useRef<DaggerInstance[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    // Generate initial floating daggers
    const list: DaggerInstance[] = [];
    // 8 exquisitely arranged daggers
    for (let i = 0; i < 8; i++) {
      list.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        z: Math.random() * 0.8 + 0.2, // Depth factor
        scale: Math.random() * 0.3 + 0.45, // Masterful scaling
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        spinSpeedX: (Math.random() - 0.5) * 0.006,
        spinSpeedY: (Math.random() - 0.5) * 0.012,
        spinSpeedZ: (Math.random() - 0.5) * 0.004,
        driftX: (Math.random() - 0.5) * 0.04,
        driftY: (Math.random() - 0.5) * 0.03,
        glintTimer: Math.random() * 100,
        glintPos: null
      });
    }
    instancesRef.current = list;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Canvas size handler
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // 3D rotation helper functions
    const rotateX = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x,
        y: p.y * cos - p.z * sin,
        z: p.y * sin + p.z * cos
      };
    };

    const rotateY = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x * cos + p.z * sin,
        y: p.y,
        z: -p.x * sin + p.z * cos
      };
    };

    const rotateZ = (p: Point3D, angle: number): Point3D => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return {
        x: p.x * cos - p.y * sin,
        y: p.x * sin + p.y * cos,
        z: p.z
      };
    };

    // Main render loop
    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse movement interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Lighting vector setup (reacts to user mouse for reactive glint reflections)
      const lightSource = {
        x: (mouse.x - 0.5) * 2.5,
        y: -(mouse.y - 0.5) * 2.5 - 0.5,
        z: 1.2
      };
      // Normalize light source vector
      const len = Math.sqrt(lightSource.x * lightSource.x + lightSource.y * lightSource.y + lightSource.z * lightSource.z);
      const lightDir = { x: lightSource.x / len, y: lightSource.y / len, z: lightSource.z / len };

      // Render each dagger
      instancesRef.current.forEach((dagger) => {
        // Apply drift movement
        dagger.x += dagger.driftX;
        dagger.y += dagger.driftY;

        // Wrap around boundaries
        if (dagger.x < -10) dagger.x = 110;
        if (dagger.x > 110) dagger.x = -10;
        if (dagger.y < -10) dagger.y = 110;
        if (dagger.y > 110) dagger.y = -10;

        // Apply rotation
        dagger.rx += dagger.spinSpeedX;
        dagger.ry += dagger.spinSpeedY;
        dagger.rz += dagger.spinSpeedZ;

        // Add slow glint progression
        dagger.glintTimer += 0.5;

        // Calculate absolute position on screen
        const screenX = (dagger.x / 100) * canvas.width;
        const screenY = (dagger.y / 100) * canvas.height;
        const scale = dagger.scale * (dagger.z * 0.6 + 0.4);

        // Project and rotate vertices
        const projectedVertices = DAGGER_VERTICES.map((v) => {
          let p = { x: v.x * scale, y: v.y * scale, z: v.z * scale };
          p = rotateX(p, dagger.rx + (mouse.y - 0.5) * 0.3); // Mouse tilt interaction
          p = rotateY(p, dagger.ry + (mouse.x - 0.5) * 0.3);
          p = rotateZ(p, dagger.rz);
          return {
            x: p.x + screenX,
            y: -p.y + screenY, // Invert Y for standard screen coordinates
            z: p.z
          };
        });

        // Compute average depth (average Z) for each face to perform accurate Painter's depth sorting
        const facesWithDepth = DAGGER_FACES.map((face, index) => {
          const zs = face.indices.map((i) => projectedVertices[i].z);
          const avgZ = zs.reduce((sum, val) => sum + val, 0) / zs.length;
          return { face, avgZ, originalIndex: index };
        });

        // Sort faces back to front (Painter's algorithm)
        facesWithDepth.sort((a, b) => a.avgZ - b.avgZ);

        let brightestGlintVal = 0;
        let brightestGlintCoord = { x: 0, y: 0 };

        // Render each sorted face
        facesWithDepth.forEach(({ face }) => {
          const pts = face.indices.map((i) => projectedVertices[i]);
          if (pts.length < 3) return;

          // Compute Face Normal for Flat-Shading Lighting
          const v0 = pts[0];
          const v1 = pts[1];
          const v2 = pts[2];

          // Edge vectors
          const ax = v1.x - v0.x;
          const ay = v1.y - v0.y;
          const az = v1.z - v0.z;

          const bx = v2.x - v0.x;
          const by = v2.y - v0.y;
          const bz = v2.z - v0.z;

          // Cross product
          let nx = ay * bz - az * by;
          let ny = az * bx - ax * bz;
          let nz = ax * by - ay * bx;

          // Normalize normal vector
          const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (nLen > 0) {
            nx /= nLen;
            ny /= nLen;
            nz /= nLen;
          }

          // Backface culling: don't render faces facing away from camera (nz < 0)
          // Wait, since we are doing transparent/semi-floating layered backdrop, some backfaces might look cool,
          // but true backface culling makes solids look solid.
          if (nz < 0) return;

          // Lighting intensity (dot product with light direction)
          const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
          const intensity = Math.max(0, Math.min(1, (dot + 1) / 2)); // map -1..1 to 0..1

          // Calculate final shaded color
          const r = Math.round(face.baseColor.r * (0.3 + intensity * 0.7));
          const g = Math.round(face.baseColor.g * (0.3 + intensity * 0.7));
          const b = Math.round(face.baseColor.b * (0.3 + intensity * 0.7));
          const opacity = dagger.z * 0.35 + 0.05; // further back = more faint

          // Draw the polygon face
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fill();

          // Subtle shiny metallic edge stroke
          const strokeOpacity = opacity * 0.5;
          ctx.strokeStyle = `rgba(241, 229, 172, ${strokeOpacity})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();

          // Track brightest glint spot on the blade for the star sparkle effect
          if (face.type === "blade" && intensity > brightestGlintVal) {
            brightestGlintVal = intensity;
            brightestGlintCoord = { x: v0.x, y: v0.y };
          }
        });

        // Occasional magic star sparkle on high reflections
        if (brightestGlintVal > 0.88 && Math.sin(dagger.glintTimer * 0.15) > 0.85) {
          const size = (Math.sin(dagger.glintTimer * 0.3) + 1) * 3 + 1;
          const x = brightestGlintCoord.x;
          const y = brightestGlintCoord.y;
          const sparkleOpacity = (dagger.z * 0.8) * Math.min(1, (brightestGlintVal - 0.88) * 8);

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(dagger.glintTimer * 0.05);
          ctx.fillStyle = `rgba(255, 255, 255, ${sparkleOpacity})`;
          
          // Draw a 4-point star flare
          ctx.beginPath();
          ctx.moveTo(0, -size * 2);
          ctx.quadraticCurveTo(0, 0, size * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, size * 2);
          ctx.quadraticCurveTo(0, 0, -size * 2, 0);
          ctx.quadraticCurveTo(0, 0, 0, -size * 2);
          ctx.fill();

          // Draw inner bright glow center
          ctx.beginPath();
          ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(241, 229, 172, ${sparkleOpacity * 0.9})`;
          ctx.fill();

          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
    />
  );
};
