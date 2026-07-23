import { describe, it, expect } from 'vitest'
import { Dataset } from '../../models/Dataset'
import { Municipio } from '../../models/Municipio'
import { Indicador } from '../../models/Indicador'

function buildDataset() {
  const municipioA = new Municipio({
    id: 1,
    nome: 'A',
    estado: { id: 35, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
    populacao: 100,
    area: 50,
  })
  const municipioB = new Municipio({
    id: 2,
    nome: 'B',
    estado: { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })

  const indicadores = [
    new Indicador({ id: '1', nome: 'População', unidade: 'hab', fonte: 'ibge', periodo: '2025', valor: 100, municipioId: 1 }),
    new Indicador({ id: '2', nome: 'Área', unidade: 'km²', fonte: 'ibge', periodo: '2010', valor: 50, municipioId: 1 }),
    new Indicador({ id: '3', nome: 'População', unidade: 'hab', fonte: 'ibge', periodo: '2025', valor: 200, municipioId: 2 }),
  ]

  return new Dataset({ municipios: [municipioA, municipioB], indicadores, fonte: 'ibge' })
}

describe('Dataset', () => {
  it('filters indicators by municipio', () => {
    const dataset = buildDataset()
    const resultado = dataset.filtrarPorMunicipio(1)
    expect(resultado).toHaveLength(2)
    expect(resultado.every((i) => i.municipioId === 1)).toBe(true)
  })

  it('returns an empty array for a municipio with no indicators', () => {
    const dataset = buildDataset()
    expect(dataset.filtrarPorMunicipio(999)).toEqual([])
  })

  it('returns unique indicator names', () => {
    const dataset = buildDataset()
    expect(dataset.nomesIndicadores).toEqual(['População', 'Área'])
  })

  it('produces export-ready plain data', () => {
    const dataset = buildDataset()
    const exportData = dataset.toExportData()

    expect(exportData.fonte).toBe('ibge')
    expect(exportData.municipios).toHaveLength(2)
    expect(exportData.municipios[0].densidadeDemografica).toBe(2)
    expect(exportData.indicadores).toHaveLength(3)
    expect(typeof exportData.consultadoEm).toBe('string')
  })
})
