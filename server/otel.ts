import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { logger } from '@/server/logger';

let sdk: NodeSDK | null = null;

export async function registerOTel() {
  if (sdk) return;

  sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
    }),
    instrumentations: [getNodeAutoInstrumentations()]
  });

  try {
    await sdk.start();
    logger.info('OpenTelemetry iniciado');
  } catch (err) {
    logger.error({ err }, 'Erro ao iniciar OpenTelemetry');
  }
}

export async function shutdownOTel() {
  await sdk?.shutdown();
  sdk = null;
}
