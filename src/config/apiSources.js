/**
 * Registry of data sources available to the application. Each entry
 * describes a source's identity and how to reach its documentation.
 * Future phases can register additional sources here (BCB, INMET, etc.)
 * without touching consumer code.
 */
export const API_SOURCES = [
  {
    id: 'ibge',
    nome: 'IBGE - Instituto Brasileiro de Geografia e Estatística',
    descricao: 'Dados estatísticos, geográficos e demográficos do Brasil',
    orgao: 'IBGE',
    url: 'https://servicodados.ibge.gov.br/api',
    documentacao: 'https://servicodados.ibge.gov.br/api/docs',
    frequencia: 'Variável por pesquisa',
    formato: 'JSON',
    cors: true,
    ativa: true,
  },
]

export default API_SOURCES
