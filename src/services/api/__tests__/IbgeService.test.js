import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { IbgeService } from '../../../services/api/IbgeService'
import { ApiResponse } from '../../../models/ApiResponse'
import { ApiError } from '../../../models/ApiError'

/**
 * @param {any} body
 * @param {{ ok?: boolean, status?: number }} [opts]
 */
function jsonResponse(body, opts = {}) {
  return {
    ok: opts.ok ?? true,
    status: opts.status ?? 200,
    json: async () => body,
  }
}

describe('IbgeService', () => {
  /** @type {IbgeService} */
  let service

  beforeEach(() => {
    service = new IbgeService()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('parses a successful municipios response', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse([
        {
          id: 3550308,
          nome: 'São Paulo',
          microrregiao: {
            mesorregiao: {
              UF: { id: 35, sigla: 'SP', nome: 'São Paulo', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' } },
            },
          },
        },
      ])
    )

    const resposta = await service.buscarMunicipios('são paulo')

    expect(resposta).toBeInstanceOf(ApiResponse)
    expect(resposta.source).toBe('ibge')
    expect(resposta.data).toHaveLength(1)
    expect(resposta.data[0].nome).toBe('São Paulo')
    expect(resposta.data[0].estado.sigla).toBe('SP')
  })

  it('filters municipios client-side by name', async () => {
    fetch.mockResolvedValueOnce(
      jsonResponse([
        { id: 1, nome: 'Abadia de Goiás', microrregiao: { mesorregiao: { UF: { id: 52, sigla: 'GO', nome: 'Goiás', regiao: { id: 5, sigla: 'CO', nome: 'Centro-Oeste' } } } } },
        { id: 2, nome: 'São Paulo', microrregiao: { mesorregiao: { UF: { id: 35, sigla: 'SP', nome: 'São Paulo', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' } } } } },
      ])
    )

    const resposta = await service.buscarMunicipios('paulo')

    expect(resposta.data).toHaveLength(1)
    expect(resposta.data[0].nome).toBe('São Paulo')
  })

  it('retries on 5xx responses then succeeds', async () => {
    fetch
      .mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 503 }))
      .mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 503 }))
      .mockResolvedValueOnce(
        jsonResponse([{ id: 1, sigla: 'SP', nome: 'São Paulo', regiao: { id: 3, sigla: 'SE', nome: 'Sudeste' } }])
      )

    const promise = service.buscarEstados()
    await vi.runAllTimersAsync?.().catch(() => {})

    const resposta = await promise
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(resposta.data[0].sigla).toBe('SP')
  }, 10000)

  it('does not retry on 404 and throws ApiError', async () => {
    fetch.mockResolvedValueOnce(jsonResponse(null, { ok: false, status: 404 }))

    await expect(service.buscarMunicipioPorId(999)).rejects.toBeInstanceOf(ApiError)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('throws ApiError after exhausting retries on repeated network errors', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(service.buscarEstados()).rejects.toBeInstanceOf(ApiError)
    expect(fetch).toHaveBeenCalledTimes(4)
  }, 15000)

  it('aborts previous in-flight request of the same type when a new one starts', async () => {
    let signals = []
    fetch.mockImplementation((_url, options) => {
      signals.push(options.signal)
      return new Promise((resolve) => {
        setTimeout(() => resolve(jsonResponse([])), 50)
      })
    })

    const primeira = service.buscarMunicipios('a')
    const segunda = service.buscarMunicipios('b')

    await Promise.allSettled([primeira, segunda])

    expect(signals[0].aborted).toBe(true)
  })

  it('checkHealth returns false on network failure', async () => {
    fetch.mockRejectedValueOnce(new TypeError('network error'))
    const saudavel = await service.checkHealth()
    expect(saudavel).toBe(false)
  })

  it('checkHealth returns true on ok response', async () => {
    fetch.mockResolvedValueOnce(jsonResponse([]))
    const saudavel = await service.checkHealth()
    expect(saudavel).toBe(true)
  })

  it('abort() cancels all pending controllers', async () => {
    fetch.mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        options.signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError')))
      })
    })

    const promise = service.buscarMunicipios('x')
    service.abort()

    await expect(promise).rejects.toMatchObject({ name: 'AbortError' })
  })
})
