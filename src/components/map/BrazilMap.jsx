import { useMemo } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import { ESTADO_CENTROIDES } from '../../config/estadoCentroides'
import styles from './BrazilMap.module.css'

// Fix Leaflet's default marker icon paths, which break under bundlers
// like Vite because the referenced image URLs get rewritten.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

const BRAZIL_CENTER = [-14.235, -51.9253]
const DEFAULT_ZOOM = 4

/**
 * Leaflet map centered on Brazil, with a marker per municipality that
 * has known coordinates. Since the IBGE municipio model does not carry
 * lat/lng, municipalities are shown via an approximate placement
 * derived from their state centroid when no coordinates are supplied.
 *
 * @param {{
 *   municipios: Array<import('../../models/Municipio').Municipio & { lat?: number, lng?: number }>,
 *   indicadoresPorMunicipio?: Record<number, Array<{ nome: string, valor: number|null, unidade: string }>>,
 * }} props
 */
function BrazilMap({ municipios = [], indicadoresPorMunicipio = {} }) {
  const markers = useMemo(
    () =>
      municipios
        .map((municipio) => {
          if (municipio.lat != null && municipio.lng != null) {
            return { ...municipio, lat: municipio.lat, lng: municipio.lng }
          }
          const centroide = ESTADO_CENTROIDES[municipio.estado?.sigla]
          return centroide ? { ...municipio, lat: centroide[0], lng: centroide[1] } : null
        })
        .filter(Boolean),
    [municipios]
  )

  return (
    <div className={styles.mapWrapper}>
      <MapContainer
        center={BRAZIL_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map((municipio) => (
          <Marker key={municipio.id} position={[municipio.lat, municipio.lng]}>
            <Popup>
              <strong>{municipio.nomeCompleto ?? municipio.nome}</strong>
              <ul className={styles.popupList}>
                {(indicadoresPorMunicipio[municipio.id] ?? []).map((indicador) => (
                  <li key={indicador.nome}>
                    {indicador.nome}:{' '}
                    {indicador.valor != null
                      ? indicador.valor.toLocaleString('pt-BR')
                      : '—'}{' '}
                    {indicador.unidade}
                  </li>
                ))}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}

export default BrazilMap
