/**
 * Available IBGE indicators and the aggregate/variable/period
 * combination used to fetch each of them via the Agregados (SIDRA) API.
 *
 * - `agregadoId`: IBGE aggregate table id.
 * - `variavel`: variable id within that aggregate.
 * - `periodos`: period selector accepted by the API ('-1' means "last
 *   period", a literal year like '2010' pins a single period).
 * - `suportaPeriodo`: when true, the user may pick a year and the
 *   controller will replace the default periodos with the chosen year.
 */
export const INDICADORES_IBGE = [
  {
    id: 'populacao',
    nome: 'População residente estimada',
    agregadoId: '6579',
    variavel: '9324',
    periodos: '-1',
    unidade: 'habitantes',
    suportaPeriodo: true,
  },
  {
    id: 'area',
    nome: 'Área territorial',
    agregadoId: '1301',
    variavel: '615',
    periodos: '2010',
    unidade: 'km²',
    suportaPeriodo: false,
  },
  {
    id: 'densidade',
    nome: 'Densidade demográfica',
    agregadoId: '1301',
    variavel: '615',
    periodos: '2010',
    unidade: 'hab/km²',
    suportaPeriodo: false,
    derivadoDe: ['populacao', 'area'],
  },
  {
    id: 'pib',
    nome: 'Produto Interno Bruto a preços correntes',
    agregadoId: '5938',
    variavel: '37',
    periodos: '-1',
    unidade: 'mil reais',
    suportaPeriodo: true,
  },
  {
    id: 'pib-per-capita',
    nome: 'PIB per capita',
    agregadoId: '5938',
    variavel: '37',
    periodos: '-1',
    unidade: 'reais',
    suportaPeriodo: true,
    derivadoDe: ['pib', 'populacao'],
  },
  {
    id: 'alfabetizacao',
    nome: 'Taxa de alfabetização (10 anos ou mais)',
    agregadoId: '1383',
    variavel: '1646',
    periodos: '2010',
    unidade: '%',
    suportaPeriodo: false,
    classificacoes: [{ id: '2', categorias: ['6794'] }],
  },
]

/**
 * Indicators used automatically by the comparison page.
 */
export const INDICADORES_COMPARACAO_PADRAO = [
  'populacao',
  'area',
  'densidade',
  'pib',
  'pib-per-capita',
  'alfabetizacao',
]

export default INDICADORES_IBGE
