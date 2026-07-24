import { describe, expect, it, vi } from 'vitest'
import { ComparacaoController } from '../ComparacaoController'

function makeConsultaControllerMock() {
  return {
    executar: vi.fn().mockResolvedValue({
      filtrarPorMunicipio: (id) => [
        { nome: 'População residente estimada', valor: id === 1 ? 1000 : 2000 },
        { nome: 'Área territorial', valor: 100 },
        { nome: 'Densidade demográfica', valor: id === 1 ? 10 : 20 },
        { nome: 'Produto Interno Bruto a preços correntes', valor: id === 1 ? 5000 : 8000 },
      ],
      nomesIndicadores: [
        'População residente estimada',
        'Área territorial',
        'Densidade demográfica',
        'Produto Interno Bruto a preços correntes',
      ],
    }),
    abort: vi.fn(),
  }
}

describe('ComparacaoController', () => {
  it('fetches default comparison indicators automatically', async () => {
    const consultaController = makeConsultaControllerMock()
    const controller = new ComparacaoController({ consultaController })

    await controller.comparar(1, 2)

    expect(consultaController.executar).toHaveBeenCalledWith(
      [1, 2],
      expect.arrayContaining(['populacao', 'area', 'densidade', 'pib', 'pib-per-capita', 'alfabetizacao']),
      null
    )
  })

  it('merges user-selected extra indicators with defaults', async () => {
    const consultaController = makeConsultaControllerMock()
    const controller = new ComparacaoController({ consultaController })

    await controller.comparar(1, 2, ['alfabetizacao'], '2020')

    expect(consultaController.executar).toHaveBeenCalledWith(
      [1, 2],
      expect.arrayContaining(['populacao', 'alfabetizacao']),
      '2020'
    )
  })
})
