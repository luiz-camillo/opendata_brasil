/**
 * @interface DataSourceService
 * Generic contract that every concrete data source (IBGE, and future
 * sources such as BCB or INMET) must implement. Consumers (controllers,
 * hooks) should depend on this contract rather than on concrete classes.
 */
export class DataSourceService {
  /**
   * Unique identifier of this source (e.g. 'ibge').
   * @returns {string}
   */
  get sourceId() {
    throw new Error('Not implemented')
  }

  /**
   * Human-readable display name of this source.
   * @returns {string}
   */
  get sourceName() {
    throw new Error('Not implemented')
  }

  /**
   * Checks whether the underlying API is currently reachable.
   * @returns {Promise<boolean>}
   */
  async checkHealth() {
    throw new Error('Not implemented')
  }

  /**
   * Searches municipalities/entities matching a free-text query.
   * @param {string} query
   * @returns {Promise<import('../../models/ApiResponse').ApiResponse>}
   */
  async buscarLocalidades(_query) {
    throw new Error('Not implemented')
  }

  /**
   * Fetches indicator values for a set of entities.
   * @param {number[]} ids
   * @param {string[]} indicadores
   * @returns {Promise<import('../../models/ApiResponse').ApiResponse>}
   */
  async buscarIndicadores(_ids, _indicadores) {
    throw new Error('Not implemented')
  }
}

export default DataSourceService
