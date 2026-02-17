// ---------------------------------------------------------------------------
// Adds 3D landmark models (Leuchtturm, Teepott) to the Mapbox map
// Uses the native Mapbox GL JS v3 model source + model layer API.
// ---------------------------------------------------------------------------

import mapboxgl from 'mapbox-gl'
import { LANDMARK_MODELS } from './landmarks'

/**
 * Registers a `model` source with all landmark GLB files and adds
 * a `model` layer to render them on the map with shadows and lighting.
 *
 * Call this inside the `style.load` handler after terrain and config
 * properties have been set.
 */
export function addLandmarkModels(map: mapboxgl.Map): void {
  // Build models spec from landmark data (immutable transform)
  const models = LANDMARK_MODELS.reduce<
    Record<string, {
      uri: string
      position: [number, number]
      orientation: [number, number, number]
    }>
  >((acc, lm) => ({
    ...acc,
    [lm.id]: {
      uri: lm.uri,
      position: lm.position,
      orientation: lm.orientation,
    },
  }), {})

  // Add model source — each model has its own position embedded
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.addSource('landmarks', {
    type: 'model',
    models,
  } as any)

  // Add model layer with rendering properties
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map.addLayer({
    id: 'landmark-models',
    type: 'model',
    source: 'landmarks',
    paint: {
      'model-scale': [15, 15, 15],
      'model-cast-shadows': true,
      'model-receive-shadows': true,
      'model-opacity': 1.0,
      'model-color-mix-intensity': 0.0,
      'model-emissive-strength': 0.3,
    },
  } as any)
}
