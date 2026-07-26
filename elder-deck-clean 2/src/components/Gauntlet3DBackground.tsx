import React, { useEffect, useRef } from "react";

interface Point3D {
  x: number;
  y: number;
  z: number;
}

interface Face {
  indices: number[];
  type: "steel" | "gold" | "leather";
  baseColor: { r: number; g: number; b: number };
}

// 3D vertices of a sturdy knight's steel gauntlet with golden trim
const GAUNTLET_VERTICES: Point3D[] = [
  // Forearm Cuff
  { x: -22, y: -45, z: 12 },  // 0: Cuff lower front-left
  { x: 22, y: -45, z: 12 },   // 1: Cuff lower front-right
  { x: 22, y: -45, z: -12 },  // 2: Cuff lower back-right
  { x: -22, y: -45, z: -12 }, // 3: Cuff lower back-left

  { x: -16, y: -20, z: 11 },  // 4: Cuff upper front-left
  { x: 16, y: -20, z: 11 },   // 5: Cuff upper front-right
  { x: 16, y: -20, z: -11 },  // 6: Cuff upper back-right
  { x: -16, y: -20, z: -11 }, // 7: Cuff upper back-left

  // Hand Backplate
  { x: -13, y: 5, z: 12 },    // 8: Backplate left
  { x: 13, y: 5, z: 12 },     // 9: Backplate right
  { x: 13, y: 5, z: -10 },    // 10: Backplate back-right
  { x: -13, y: 5, z: -10 },   // 11: Backplate back-left

  // Knuckles (Segmented high-strength ridge)
  { x: -14, y: 16, z: 13 },   // 12: Knuckle joint left
  { x: -5, y: 20, z: 15 },    // 13: Knuckle index peak
  { x: 5, y: 20, z: 15 },     // 14: Knuckle middle peak
  { x: 14, y: 16, z: 13 },    // 15: Knuckle right joint

  // Fingers (Pointed steel tips)
  { x: -13, y: 32, z: 10 },   // 16: Index joint
  { x: -11, y: 44, z: 6 },    // 17: Index tip

  { x: -4, y: 35, z: 11 },    // 18: Middle joint
  { x: -3, y: 49, z: 7 },     // 19: Middle tip

  { x: 4, y: 33, z: 11 },     // 20: Ring joint
  { x: 3, y: 46, z: 7 },      // 21: Ring tip

  { x: 12, y: 28, z: 9 },     // 22: Pinky joint
  { x: 10, y: 39, z: 5 },     // 23: Pinky tip

  // Thumb
  { x: -18, y: -8, z: 8 },    // 24: Thumb base
  { x: -28, y: 2, z: 6 },     // 25: Thumb joint
  { x: -33, y: 12, z: 2 },    // 26: Thumb tip

  // Wrist Golden Band Accents
  { x: -16.5, y: -19, z: 11.5 }, // 27
  { x: 16.5, y: -19, z: 11.5 },  // 28
  { x: 16.5, y: -19, z: -11.5 }, // 29
  { x: -16.5, y: -19, z: -11.5 }  // 30
];

const GAUNTLET_FACES: Face[] = [
  // --- Cuff Outer Panels ---
  { indices: [0, 1, 5, 4], type: "steel", baseColor: { r: 195, g: 202, b: 212 } },
  { indices: [1, 2, 6, 5], type: "steel", baseColor: { r: 175, g: 182, b: 192 } },
  { indices: [2, 3, 7, 6], type: "steel", baseColor: { r: 160, g: 166, b: 176 } },
  { indices: [3, 0, 4, 7], type: "steel", baseColor: { r: 175, g: 182, b: 192 } },

  // --- Imperial Wrist Gold Rings ---
  { indices: [4, 5, 28, 27], type: "gold", baseColor: { r: 218, g: 165, b: 32 } },
  { indices: [5, 6, 29, 28], type: "gold", baseColor: { r: 200, g: 150, b: 25 } },
  { indices: [6, 7, 30, 29], type: "gold", baseColor: { r: 180, g: 135, b: 20 } },
  { indices: [7, 4, 27, 30], type: "gold", baseColor: { r: 200, g: 150, b: 25 } },

  // --- Hand Plate ---
  { indices: [27, 28, 9, 8], type: "steel", baseColor: { r: 200, g: 208, b: 218 } },
  { indices: [28, 29, 10, 9], type: "steel", baseColor: { r: 180, g: 188, b: 198 } },
  { indices: [30, 27, 8, 11], type: "steel", baseColor: { r: 180, g: 188, b: 198 } },

  // --- Knuckle Shield ---
  { indices: [8, 9, 15, 14], type: "steel", baseColor: { r: 205, g: 212, b: 222 } },
  { indices: [8, 14, 13], type: "steel", baseColor: { r: 215, g: 222, b: 232 } },
  { indices: [8, 13, 12], type: "steel", baseColor: { r: 205, g: 212, b: 222 } },

  // --- Thumb Plates ---
  { indices: [24, 25, 26], type: "steel", baseColor: { r: 190, g: 198, b: 208 } },
  { indices: [8, 24, 25], type: "gold", baseColor: { r: 210, g: 165, b: 40 } },

  // --- Segmented Fingers (Steel Overlays) ---
  { indices: [12, 13, 16], type: "steel", baseColor: { r: 195, g: 202, b: 212 } },
  { indices: [16, 17, 13], type: "steel", baseColor: { r: 210, g: 218, b: 228 } },

  { indices: [13, 14, 18], type: "steel", baseColor: { r: 195, g: 202, b: 212 } },
  { indices: [18, 19, 14], type: "steel", baseColor: { r: 210, g: 218, b: 228 } },

  { indices: [14, 15, 20], type: "steel", baseColor: { r: 195, g: 202, b: 212 } },
  { indices: [20, 21, 15], type: "steel", baseColor: { r: 210, g: 218, b: 228 } },

  { indices: [15, 22, 23], type: "steel", baseColor: { r: 185, g: 192, b: 202 } }
];

interface GauntletInstance {
  x: number;
  y: number;
  z: number;
  scale: number;
  rx: number;
  ry: number;
  rz: number;
  spinSpeedX: number;
  spinSpeedY: number;
  spinSpeedZ: number;
  driftX: number;
  driftY: number;
  polishTimer: number;
}

export const Gauntlet3DBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const instancesRef = useRef<GauntletInstance[]>([]);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });

  useEffect(() => {
    // Generate floating knight's gauntlets
    const list: GauntletInstance[] = [];
    for (let i = 0; i < 6; i++) {
      list.push({
        // Strategically placed on the left & right sides of screen for visual balance
        x: i % 2 === 0 ? Math.random() * 25 : 75 + Math.random() * 25,
        y: Math.random() * 100,
        z: Math.random() * 0.7 + 0.3,
        scale: Math.random() * 0.25 + 0.45,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        spinSpeedX: (Math.random() - 0.5) * 0.005,
        spinSpeedY: (Math.random() - 0.5) * 0.010,
        spinSpeedZ: (Math.random() - 0.5) * 0.003,
        driftX: (Math.random() - 0.5) * 0.035,
        driftY: (Math.random() - 0.5) * 0.025,
        polishTimer: Math.random() * 50
      });
    }
    instancesRef.current = list;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX / window.innerWidth;
      mouseRef.current.targetY = e.clientY / window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);

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

    // 3D rotation algorithms
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

    // Main render function
    const render = () => {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      // Dynamic ambient lighting source matching the mouse coordinate
      const lightSource = {
        x: (mouse.x - 0.5) * 2.8,
        y: -(mouse.y - 0.5) * 2.8 - 0.4,
        z: 1.5
      };
      const len = Math.sqrt(lightSource.x * lightSource.x + lightSource.y * lightSource.y + lightSource.z * lightSource.z);
      const lightDir = { x: lightSource.x / len, y: lightSource.y / len, z: lightSource.z / len };

      instancesRef.current.forEach((gauntlet) => {
        // Drift movement calculation
        gauntlet.x += gauntlet.driftX;
        gauntlet.y += gauntlet.driftY;

        // Keep gauntlets wrapped within bounds
        if (gauntlet.x < -15) gauntlet.x = 115;
        if (gauntlet.x > 115) gauntlet.x = -15;
        if (gauntlet.y < -15) gauntlet.y = 115;
        if (gauntlet.y > 115) gauntlet.y = -15;

        gauntlet.rx += gauntlet.spinSpeedX;
        gauntlet.ry += gauntlet.spinSpeedY;
        gauntlet.rz += gauntlet.spinSpeedZ;
        gauntlet.polishTimer += 0.4;

        const screenX = (gauntlet.x / 100) * canvas.width;
        const screenY = (gauntlet.y / 100) * canvas.height;
        const scale = gauntlet.scale * (gauntlet.z * 0.6 + 0.4);

        // Project 3D points
        const projectedVertices = GAUNTLET_VERTICES.map((v) => {
          let p = { x: v.x * scale, y: v.y * scale, z: v.z * scale };
          p = rotateX(p, gauntlet.rx + (mouse.y - 0.5) * 0.25);
          p = rotateY(p, gauntlet.ry + (mouse.x - 0.5) * 0.25);
          p = rotateZ(p, gauntlet.rz);
          return {
            x: p.x + screenX,
            y: -p.y + screenY,
            z: p.z
          };
        });

        // Face depth sorting
        const sortedFaces = GAUNTLET_FACES.map((face, index) => {
          const zs = face.indices.map((i) => projectedVertices[i].z);
          const avgZ = zs.reduce((sum, val) => sum + val, 0) / zs.length;
          return { face, avgZ, originalIndex: index };
        });

        sortedFaces.sort((a, b) => a.avgZ - b.avgZ);

        sortedFaces.forEach(({ face }) => {
          const pts = face.indices.map((i) => projectedVertices[i]);
          if (pts.length < 3) return;

          // Backface culling
          const v0 = pts[0];
          const v1 = pts[1];
          const v2 = pts[2];

          const ax = v1.x - v0.x;
          const ay = v1.y - v0.y;
          const az = v1.z - v0.z;

          const bx = v2.x - v0.x;
          const by = v2.y - v0.y;
          const bz = v2.z - v0.z;

          let nx = ay * bz - az * by;
          let ny = az * bx - ax * bz;
          let nz = ax * by - ay * bx;

          const nLen = Math.sqrt(nx * nx + ny * ny + nz * nz);
          if (nLen > 0) {
            nx /= nLen;
            ny /= nLen;
            nz /= nLen;
          }

          if (nz < 0) return; // Cull back-facing polygons

          // Shade calculation
          const dot = nx * lightDir.x + ny * lightDir.y + nz * lightDir.z;
          const intensity = Math.max(0, Math.min(1, (dot + 1) / 2));

          const r = Math.round(face.baseColor.r * (0.35 + intensity * 0.65));
          const g = Math.round(face.baseColor.g * (0.35 + intensity * 0.65));
          const b = Math.round(face.baseColor.b * (0.35 + intensity * 0.65));
          const opacity = gauntlet.z * 0.25 + 0.05; // further back = more faint

          // Draw Face
          ctx.beginPath();
          ctx.moveTo(pts[0].x, pts[0].y);
          for (let i = 1; i < pts.length; i++) {
            ctx.lineTo(pts[i].x, pts[i].y);
          }
          ctx.closePath();

          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          ctx.fill();

          // Delicate metallic edge reflection stroke
          ctx.strokeStyle = `rgba(212, 175, 55, ${opacity * 0.4})`; // gold shine outline
          ctx.lineWidth = 0.55;
          ctx.stroke();
        });
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
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
    />
  );
};
