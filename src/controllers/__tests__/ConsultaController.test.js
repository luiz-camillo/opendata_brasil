import { describe, it, expect, vi, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { ConsultaController } from '../../controllers/ConsultaController'
import { Dataset } from '../../models/Dataset'
import { Municipio } from '../../models/Municipio'
import { ApiResponse } from '../../models/ApiResponse'

function fakeMunicipio(id, nome) {
  return new Municipio({
    id,
    nome,
    estado: { id: 35, sigla: 'SP', nome: 'São Paulo' },
    regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' },
  })
}

function makeIbgeServiceMock({ municipioFalha } = {}) {
  return {
    buscarMunicipioPorId: vi.fn(async (id) => {
      if (id === municipioFalha) {
        throw new Error('municipio indisponivel')
      }
      return new ApiResponse({ data: fakeMunicipio(id, `Municipio ${id}`), source: 'ibge' })
    }),
    buscarAgregado: vi.fn(async (agregadoId, localidades) => {
      return new ApiResponse({
        data: [
          {
            id: agregadoId,
            resultados: [
              {
                series: localidades.map((id) => ({
                  localidade: { id: String(id) },
                  serie: { '2025': '1000' },
                })),
              },
            ],
          },
        ],
        source: 'ibge',
      })
    }),
    abort: vi.fn(),
  }
}

describe('ConsultaController', () => {
  beforeEach(async () => {
    localStorage.clear()
    await new ConsultaController().storageService.clearAll()
  })

  it('runs the full query flow and returns a Dataset', async () => {
    const ibgeService = makeIbgeServiceMock()
    const controller = new ConsultaController({ ibgeService })

    const dataset = await controller.executar([1, 2], ['populacao'])

    expect(dataset).toBeInstanceOf(Dataset)
    expect(dataset.municipios).toHaveLength(2)
    expect(dataset.indicadores.length).toBeGreaterThan(0)
    expect(ibgeService.buscarMunicipioPorId).toHaveBeenCalledTimes(2)
  })

  it('saves the query as the last consulta', async () => {
    const ibgeService = makeIbgeServiceMock()
    const controller = new ConsultaController({ ibgeService })

    await controller.executar([1], ['populacao'], '2020')

    const ultima = await controller.storageService.recuperarUltimaConsulta()
    expect(ultima.municipios).toEqual([1])
    expect(ultima.indicadores).toEqual(['populacao'])
    expect(ultima.periodo).toBe('2020')
  })

  it('uses a period override when provided', async () => {
    const ibgeService = makeIbgeServiceMock()
    const controller = new ConsultaController({ ibgeService })

    await controller.executar([1], ['populacao'], '2020')

    expect(ibgeService.buscarAgregado).toHaveBeenCalledWith('6579', [1], '2020', '9324', [])
  })

  it('uses the cache on a second identical query (does not refetch indicators)', async () => {
    const ibgeService = makeIbgeServiceMock()
    const controller = new ConsultaController({ ibgeService })

    await controller.executar([1], ['populacao'])
    await controller.executar([1], ['populacao'])

    expect(ibgeService.buscarAgregado).toHaveBeenCalledTimes(1)
  })

  it('returns partial results when one municipio fetch fails', async () => {
    const ibgeService = makeIbgeServiceMock({ municipioFalha: 2 })
    const controller = new ConsultaController({ ibgeService })

    const dataset = await controller.executar([1, 2], ['populacao'])

    expect(dataset.municipios).toHaveLength(1)
    expect(dataset.municipios[0].id).toBe(1)
  })

  it('throws when validation fails (no municipios selected)', async () => {
    const ibgeService = makeIbgeServiceMock()
    const controller = new ConsultaController({ ibgeService })

    await expect(controller.executar([], ['populacao'])).rejects.toThrow()
  })
})
