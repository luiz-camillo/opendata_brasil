import { describe, it, expect } from 'vitest'
import { Comparador } from '../../models/Comparador'
import { Dataset } from '../../models/Dataset'
import { Municipio } from '../../models/Municipio'
import { Indicador } from '../../models/Indicador'

function build() {
  const municipioA = new Municipio({
    id: 1,
    nome: 'A',
    estado: { id: 1, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })
  const municipioB = new Municipio({
    id: 2,
    nome: 'B',
    estado: { id: 1, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })

  const indicadores = [
    new Indicador({ id: 'pop-1', nome: 'População', unidade: 'hab', fonte: 'ibge', periodo: '2025', valor: 200, municipioId: 1 }),
    new Indicador({ id: 'pop-2', nome: 'População', unidade: 'hab', fonte: 'ibge', periodo: '2025', valor: 100, municipioId: 2 }),
    new Indicador({ id: 'area-1', nome: 'Área', unidade: 'km²', fonte: 'ibge', periodo: '2010', valor: null, municipioId: 1 }),
  ]

  const dataset = new Dataset({ municipios: [municipioA, municipioB], indicadores, fonte: 'ibge' })
  return { dataset, municipioA, municipioB }
}

describe('Comparador', () => {
  it('computes difference and percentage difference between two municipios', () => {
    const { dataset } = build()
    const comparador = new Comparador(dataset)

    const resultado = comparador.comparar(1, 2)
    const populacao = resultado.find((r) => r.indicador === 'População')

    expect(populacao.valorA).toBe(200)
    expect(populacao.valorB).toBe(100)
    expect(populacao.diferenca).toBe(100)
    expect(populacao.diferencaPercentual).toBe(100)
  })

  it('returns null diff when one of the values is missing', () => {
    const { dataset } = build()
    const comparador = new Comparador(dataset)

    const resultado = comparador.comparar(1, 2)
    const area = resultado.find((r) => r.indicador === 'Área')

    expect(area.valorA).toBeNull()
    expect(area.valorB).toBeNull()
    expect(area.diferenca).toBeNull()
    expect(area.diferencaPercentual).toBeNull()
  })

  it('returns one entry per unique indicator name', () => {
    const { dataset } = build()
    const comparador = new Comparador(dataset)
    const resultado = comparador.comparar(1, 2)
    expect(resultado).toHaveLength(dataset.nomesIndicadores.length)
  })
})
