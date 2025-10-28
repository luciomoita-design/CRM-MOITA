import { registerOTel } from '@/server/otel';

export async function register() {
  await registerOTel();
}
