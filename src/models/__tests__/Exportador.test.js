import { describe, it, expect } from 'vitest'
import { Exportador } from '../../models/Exportador'
import { Dataset } from '../../models/Dataset'
import { Municipio } from '../../models/Municipio'
import { Indicador } from '../../models/Indicador'

function buildDataset() {
  const municipio = new Municipio({
    id: 1,
    nome: 'São Paulo',
    estado: { id: 35, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })

  const indicador = new Indicador({
    id: 'pop-1',
    nome: 'População',
    unidade: 'habitantes',
    fonte: 'ibge',
    periodo: '2025-01-01',
    valor: 11904961,
    municipioId: 1,
  })

  return new Dataset({ municipios: [municipio], indicadores: [indicador], fonte: 'ibge' })
}

describe('Exportador', () => {
  it('generates a CSV with header and one row per indicador', () => {
    const exportador = new Exportador(buildDataset())
    const csv = exportador.toCSV()
    const linhas = csv.split('\n')

    expect(linhas[0]).toBe('municipio,estado,indicador,periodo,valor,unidade,fonte')
    expect(linhas).toHaveLength(2)
    expect(linhas[1]).toContain('São Paulo')
    expect(linhas[1]).toContain('11904961')
  })

  it('escapes CSV values containing commas', () => {
    const dataset = buildDataset()
    dataset.municipios[0].nome = 'São Paulo, Capital'
    const csv = new Exportador(dataset).toCSV()
    expect(csv).toContain('"São Paulo, Capital"')
  })

  it('generates valid JSON matching Dataset.toExportData', () => {
    const dataset = buildDataset()
    const json = new Exportador(dataset).toJSON()
    const parsed = JSON.parse(json)

    expect(parsed.fonte).toBe('ibge')
    expect(parsed.municipios).toHaveLength(1)
    expect(parsed.indicadores).toHaveLength(1)
    expect(parsed.indicadores[0].valor).toBe(11904961)
  })
})
