/**
 * Build-time script: generates stylized low-poly GLB models
 * for the Warnemuende Leuchtturm and Teepott landmarks.
 *
 * Run: pnpm --filter @escape-tour/web generate-models
 */

// ---------------------------------------------------------------------------
// Node.js polyfills required by Three.js GLTFExporter
// ---------------------------------------------------------------------------

// GLTFExporter internally uses FileReader with `onloadend` callbacks.
// Node.js does not have FileReader, so we polyfill it minimally.
if (typeof globalThis.FileReader === 'undefined') {
  // @ts-expect-error — minimal FileReader polyfill for Node.js
  globalThis.FileReader = class FileReader extends EventTarget {
    result: ArrayBuffer | string | null = null
    error: Error | null = null
    readyState = 0
    onload: ((ev: { target: FileReader }) => void) | null = null
    onerror: ((ev: { target: FileReader }) => void) | null = null
    onloadend: ((ev: { target: FileReader }) => void) | null = null

    readAsArrayBuffer(blob: Blob): void {
      blob.arrayBuffer().then((buf) => {
        this.result = buf
        this.readyState = 2
        const ev = { target: this }
        if (this.onload) this.onload(ev)
        if (this.onloadend) this.onloadend(ev)
      }).catch((err) => {
        this.error = err as Error
        this.readyState = 2
        const ev = { target: this }
        if (this.onerror) this.onerror(ev)
        if (this.onloadend) this.onloadend(ev)
      })
    }

    readAsDataURL(blob: Blob): void {
      blob.arrayBuffer().then((buf) => {
        const base64 = Buffer.from(buf).toString('base64')
        const type = (blob as { type?: string }).type ?? 'application/octet-stream'
        this.result = `data:${type};base64,${base64}`
        this.readyState = 2
        const ev = { target: this }
        if (this.onload) this.onload(ev)
        if (this.onloadend) this.onloadend(ev)
      }).catch((err) => {
        this.error = err as Error
        this.readyState = 2
        const ev = { target: this }
        if (this.onerror) this.onerror(ev)
        if (this.onloadend) this.onloadend(ev)
      })
    }
  }
}

// Ensure document is available (Three.js checks for it in some paths)
if (typeof globalThis.document === 'undefined') {
  globalThis.document = {
    createElementNS: () => ({
      setAttribute: () => {},
      getContext: () => null,
    }),
  } as unknown as Document
}

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import {
  Scene,
  Group,
  Mesh,
  MeshStandardMaterial,
  CylinderGeometry,
  ConeGeometry,
  SphereGeometry,
  LatheGeometry,
  Vector2,
  DoubleSide,
} from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'

// ---------------------------------------------------------------------------
// Output directory
// ---------------------------------------------------------------------------

const OUTPUT_DIR = join(dirname(new URL(import.meta.url).pathname), '..', 'public', 'models')

// ---------------------------------------------------------------------------
// Helper: write a Scene to a .glb file
// ---------------------------------------------------------------------------

async function writeGlb(scene: Scene, filename: string): Promise<void> {
  const outputPath = join(OUTPUT_DIR, filename)

  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const exporter = new GLTFExporter()
  const glb = await exporter.parseAsync(scene, { binary: true })

  writeFileSync(outputPath, Buffer.from(glb as ArrayBuffer))
  console.log(`  ✓ ${outputPath} (${Math.round(Buffer.from(glb as ArrayBuffer).byteLength / 1024)} KB)`)
}

// ---------------------------------------------------------------------------
// Leuchtturm (Lighthouse)
// ---------------------------------------------------------------------------
// The Warnemuende lighthouse is a white cylindrical tower (~31m tall)
// with a red band near the top and a lantern room with a dome.
// We create a stylized low-poly version:
//   - Main tower: white tapered cylinder
//   - Red band: thin red cylinder near the top
//   - Lantern gallery: small dark cylinder
//   - Lantern dome: gold/yellow sphere half
//   - Roof cap: small red cone on top
// ---------------------------------------------------------------------------

function createLighthouse(): Scene {
  const scene = new Scene()
  const group = new Group()

  // Materials
  const whiteMat = new MeshStandardMaterial({ color: 0xf5f0e8 })     // warm white
  const redMat = new MeshStandardMaterial({ color: 0xc0392b })        // signal red
  const darkMat = new MeshStandardMaterial({ color: 0x2c3e50 })       // dark blue-grey
  const goldMat = new MeshStandardMaterial({
    color: 0xf4d03f,
    emissive: 0xf4d03f,
    emissiveIntensity: 0.3,
  })

  // Main tower body (tapered cylinder, wider at base)
  const tower = new Mesh(
    new CylinderGeometry(0.28, 0.38, 2.4, 16),
    whiteMat,
  )
  tower.position.y = 1.2
  group.add(tower)

  // Red band near top
  const redBand = new Mesh(
    new CylinderGeometry(0.29, 0.30, 0.15, 16),
    redMat,
  )
  redBand.position.y = 2.2
  group.add(redBand)

  // Gallery platform (dark ring)
  const gallery = new Mesh(
    new CylinderGeometry(0.35, 0.35, 0.06, 16),
    darkMat,
  )
  gallery.position.y = 2.4
  group.add(gallery)

  // Lantern room (glass section — dark/transparent-ish)
  const lanternRoom = new Mesh(
    new CylinderGeometry(0.22, 0.25, 0.35, 16),
    new MeshStandardMaterial({ color: 0x5dade2, opacity: 0.7, transparent: true }),
  )
  lanternRoom.position.y = 2.6
  group.add(lanternRoom)

  // Lantern light (gold sphere inside)
  const lanternLight = new Mesh(
    new SphereGeometry(0.12, 12, 8),
    goldMat,
  )
  lanternLight.position.y = 2.6
  group.add(lanternLight)

  // Dome / roof cap
  const dome = new Mesh(
    new ConeGeometry(0.24, 0.25, 16),
    redMat,
  )
  dome.position.y = 2.92
  group.add(dome)

  // Small tip on top
  const tip = new Mesh(
    new CylinderGeometry(0.02, 0.02, 0.15, 8),
    darkMat,
  )
  tip.position.y = 3.12
  group.add(tip)

  // Base platform
  const base = new Mesh(
    new CylinderGeometry(0.5, 0.55, 0.15, 16),
    new MeshStandardMaterial({ color: 0xbdc3c7 }),
  )
  base.position.y = 0.075
  group.add(base)

  scene.add(group)
  return scene
}

// ---------------------------------------------------------------------------
// Teepott
// ---------------------------------------------------------------------------
// The Warnemuende Teepott is a round restaurant building with a distinctive
// hyperbolic paraboloid (hypar) shell roof — a curved concrete shell.
// We approximate the silhouette with:
//   - Circular base building: flat cylinder (beige/sand)
//   - Curved shell roof: LatheGeometry with a swooping profile
//   - The roof curves upward from the edges to a raised center
// ---------------------------------------------------------------------------

function createTeepott(): Scene {
  const scene = new Scene()
  const group = new Group()

  // Materials
  const baseMat = new MeshStandardMaterial({ color: 0xe8dcc8 })     // warm sand/beige
  const roofMat = new MeshStandardMaterial({
    color: 0xecf0f1,
    side: DoubleSide,
  })
  const windowMat = new MeshStandardMaterial({
    color: 0x85c1e9,
    opacity: 0.6,
    transparent: true,
  })

  // Main building body (flat wide cylinder)
  const building = new Mesh(
    new CylinderGeometry(0.9, 0.95, 0.6, 24),
    baseMat,
  )
  building.position.y = 0.3
  group.add(building)

  // Window band (slightly larger, transparent ring)
  const windowBand = new Mesh(
    new CylinderGeometry(0.92, 0.97, 0.25, 24),
    windowMat,
  )
  windowBand.position.y = 0.42
  group.add(windowBand)

  // Hyperbolic shell roof — approximated with LatheGeometry
  // Profile: starts low at the edge, sweeps up to a peak in the center
  const roofProfile: Vector2[] = []
  const segments = 20
  for (let i = 0; i <= segments; i++) {
    const t = i / segments                        // 0 = center, 1 = outer edge
    const radius = t * 1.15                       // extends slightly beyond building
    // Curved height profile: high at center, dipping then curling at edges
    const height = 0.45 * Math.cos(t * Math.PI * 0.5) + 0.05
    roofProfile.push(new Vector2(radius, height))
  }

  const roofGeom = new LatheGeometry(roofProfile, 24)
  const roof = new Mesh(roofGeom, roofMat)
  roof.position.y = 0.6
  group.add(roof)

  // Small central skylight / peak element
  const skylight = new Mesh(
    new CylinderGeometry(0.08, 0.12, 0.1, 12),
    new MeshStandardMaterial({ color: 0x5dade2, opacity: 0.5, transparent: true }),
  )
  skylight.position.y = 1.1
  group.add(skylight)

  // Base/foundation
  const foundation = new Mesh(
    new CylinderGeometry(1.0, 1.05, 0.08, 24),
    new MeshStandardMaterial({ color: 0xbdc3c7 }),
  )
  foundation.position.y = 0.04
  group.add(foundation)

  scene.add(group)
  return scene
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log('Generating 3D landmark models...\n')

  const lighthouseScene = createLighthouse()
  await writeGlb(lighthouseScene, 'lighthouse.glb')

  const teepottScene = createTeepott()
  await writeGlb(teepottScene, 'teepott.glb')

  console.log('\nDone! Models written to public/models/')
}

main().catch((err) => {
  console.error('Failed to generate models:', err)
  process.exit(1)
})
