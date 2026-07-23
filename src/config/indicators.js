/**
 * Available IBGE indicators and the aggregate/variable/period
 * combination used to fetch each of them via the Agregados (SIDRA) API.
 *
 * - `agregadoId`: IBGE aggregate table id.
 * - `variavel`: variable id within that aggregate.
 * - `periodos`: period selector accepted by the API ('-6' means "last 6
 *   periods", a literal year like '2010' pins a single period).
 */
export const INDICADORES_IBGE = [
  {
    id: 'populacao',
    nome: 'População residente estimada',
    agregadoId: '6579',
    variavel: '9324',
    periodos: '-1',
    unidade: 'habitantes',
  },
  {
    id: 'area',
    nome: 'Área territorial',
    agregadoId: '1301',
    variavel: '615',
    periodos: '2010',
    unidade: 'km²',
  },
  {
    id: 'pib',
    nome: 'Produto Interno Bruto a preços correntes',
    agregadoId: '5938',
    variavel: '37',
    periodos: '-1',
    unidade: 'mil reais',
  },
]

export default INDICADORES_IBGE
