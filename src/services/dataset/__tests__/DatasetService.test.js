import { describe, it, expect } from 'vitest'
import { DatasetService, normalizarRespostaAgregado, normalizarPeriodo } from '../../../services/dataset/DatasetService'
import { Dataset } from '../../../models/Dataset'
import { Municipio } from '../../../models/Municipio'

function municipioSaoPaulo() {
  return new Municipio({
    id: 3550308,
    nome: 'São Paulo',
    estado: { id: 35, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })
}

describe('normalizarRespostaAgregado', () => {
  it('extracts one Indicador per municipio/period', () => {
    const raw = [
      {
        id: '9324',
        variavel: 'População residente estimada',
        unidade: 'Pessoas',
        resultados: [
          {
            classificacoes: [],
            series: [
              {
                localidade: { id: '3550308', nivel: { id: 'N6' }, nome: 'São Paulo (SP)' },
                serie: { '2025': '11904961' },
              },
            ],
          },
        ],
      },
    ]

    const indicadores = normalizarRespostaAgregado(raw, {
      id: 'populacao',
      nome: 'População residente estimada',
      unidade: 'habitantes',
    })

    expect(indicadores).toHaveLength(1)
    expect(indicadores[0].municipioId).toBe(3550308)
    expect(indicadores[0].valor).toBe(11904961)
    expect(indicadores[0].periodo).toBe('2025-01-01')
  })

  it('handles missing/null values ("...", "-", "X", null)', () => {
    const raw = [
      {
        id: '615',
        variavel: 'Área',
        unidade: 'km²',
        resultados: [
          {
            series: [
              {
                localidade: { id: '1', nome: 'A' },
                serie: { '2010': '...' },
              },
              {
                localidade: { id: '2', nome: 'B' },
                serie: { '2010': '-' },
              },
              {
                localidade: { id: '3', nome: 'C' },
                serie: { '2010': null },
              },
              {
                localidade: { id: '4', nome: 'D' },
                serie: { '2010': 'X' },
              },
            ],
          },
        ],
      },
    ]

    const indicadores = normalizarRespostaAgregado(raw, { nome: 'Área', unidade: 'km²' })
    expect(indicadores).toHaveLength(4)
    indicadores.forEach((indicador) => expect(indicador.valor).toBeNull())
  })

  it('converts numeric strings correctly, including decimals with comma', () => {
    const raw = [
      {
        id: '615',
        resultados: [
          {
            series: [
              { localidade: { id: '1' }, serie: { '2010': '1523.3' } },
              { localidade: { id: '2' }, serie: { '2010': '1523,3' } },
            ],
          },
        ],
      },
    ]

    const indicadores = normalizarRespostaAgregado(raw, { nome: 'Área', unidade: 'km²' })
    expect(indicadores[0].valor).toBeCloseTo(1523.3)
    expect(indicadores[1].valor).toBeCloseTo(1523.3)
  })
})

describe('normalizarPeriodo', () => {
  it('converts a plain year to ISO date', () => {
    expect(normalizarPeriodo('2010')).toBe('2010-01-01')
  })

  it('converts a year+month period to ISO date', () => {
    expect(normalizarPeriodo('202503')).toBe('2025-03-01')
  })

  it('falls back to the raw value for unrecognized formats', () => {
    expect(normalizarPeriodo('abc')).toBe('abc')
  })
})

describe('DatasetService.normalizar', () => {
  it('returns a Dataset built from small raw responses synchronously', async () => {
    const service = new DatasetService()
    const municipios = [municipioSaoPaulo()]

    const respostas = [
      {
        indicador: { id: 'populacao', nome: 'População', unidade: 'habitantes' },
        data: [
          {
            resultados: [
              {
                series: [
                  {
                    localidade: { id: '3550308' },
                    serie: { '2025': '11904961' },
                  },
                ],
              },
            ],
          },
        ],
      },
    ]

    const dataset = await service.normalizar(respostas, municipios)

    expect(dataset).toBeInstanceOf(Dataset)
    expect(dataset.municipios).toHaveLength(1)
    expect(dataset.indicadores).toHaveLength(1)
    expect(dataset.indicadores[0].valor).toBe(11904961)
  })

  it('handles an empty responses array gracefully', async () => {
    const service = new DatasetService()
    const dataset = await service.normalizar([], [])
    expect(dataset.indicadores).toHaveLength(0)
    expect(dataset.municipios).toHaveLength(0)
  })
})
