import { getRequestConfig } from 'next-intl/server';
import ptBR from './messages/pt-BR.json';

export default getRequestConfig(() => ({
  messages: ptBR,
  locale: 'pt-BR',
  timeZone: 'America/Fortaleza'
}));
