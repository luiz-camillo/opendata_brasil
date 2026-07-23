import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { StorageService, TTL_MINUTES } from '../../../services/storage/StorageService'
import { Consulta } from '../../../models/Consulta'

describe('StorageService', () => {
  /** @type {StorageService} */
  let storage

  beforeEach(() => {
    localStorage.clear()
    storage = new StorageService()
  })

  it('sets and gets a preference', () => {
    storage.setPreference('tema', 'escuro')
    expect(storage.getPreference('tema')).toBe('escuro')
  })

  it('returns the default value when preference is missing', () => {
    expect(storage.getPreference('inexistente', 'padrao')).toBe('padrao')
  })

  it('removes a preference', () => {
    storage.setPreference('coluna', ['nome'])
    storage.removePreference('coluna')
    expect(storage.getPreference('coluna')).toBeNull()
  })

  it('stores and retrieves cached data before expiration', async () => {
    await storage.setCachedData('chave-1', { valor: 42 }, 60)
    const dados = await storage.getCachedData('chave-1')
    expect(dados).toEqual({ valor: 42 })
  })

  it('returns null for expired cache entries', async () => {
    await storage.setCachedData('chave-2', { valor: 1 }, -1)
    const dados = await storage.getCachedData('chave-2')
    expect(dados).toBeNull()
  })

  it('returns null for a missing cache key', async () => {
    const dados = await storage.getCachedData('nao-existe')
    expect(dados).toBeNull()
  })

  it('clearAll removes every cached entry', async () => {
    await storage.setCachedData('a', 1, 60)
    await storage.setCachedData('b', 2, 60)
    await storage.clearAll()
    expect(await storage.getCachedData('a')).toBeNull()
    expect(await storage.getCachedData('b')).toBeNull()
  })

  it('clearExpired removes only expired entries', async () => {
    await storage.setCachedData('expirado', 1, -1)
    await storage.setCachedData('valido', 2, 60)
    await storage.clearExpired()
    expect(await storage.getCachedData('expirado')).toBeNull()
    expect(await storage.getCachedData('valido')).toEqual(2)
  })

  it('saves and restores the last consulta', async () => {
    const consulta = new Consulta({ municipios: [1, 2], indicadores: ['populacao'] })
    await storage.salvarUltimaConsulta(consulta)
    const restaurada = await storage.recuperarUltimaConsulta()
    expect(restaurada.municipios).toEqual([1, 2])
    expect(restaurada.indicadores).toEqual(['populacao'])
  })

  it('returns null when there is no saved consulta', async () => {
    const restaurada = await storage.recuperarUltimaConsulta()
    expect(restaurada).toBeNull()
  })

  it('exposes default TTL constants', () => {
    expect(TTL_MINUTES.CENSO).toBe(1440)
    expect(TTL_MINUTES.PADRAO).toBe(360)
  })
})
