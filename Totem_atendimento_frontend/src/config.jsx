// src/config.js
const API_BASE_URL = 'http://192.168.10.35:9000';

export const ENDPOINTS = {
  imprimirAtendimento: `${API_BASE_URL}/imprimir_atendimento`,
  salvarTicket: `${API_BASE_URL}/salvar_ticket`,
  ticketAtual: `${API_BASE_URL}/ticket_atual`,
  chamarTicket: `${API_BASE_URL}/chamar_ticket`,
  ticketImpresso: `${API_BASE_URL}/ticket_impresso`,
  login: `${API_BASE_URL}/postgressql/login`,
  socketIO: API_BASE_URL, 
};
