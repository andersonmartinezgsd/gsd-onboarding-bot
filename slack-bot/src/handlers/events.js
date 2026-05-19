import { ProcessRepository } from '../repositories/ProcessRepository.js';
import { StepRepository } from '../repositories/StepRepository.js';
import { logger } from '../utils/logger.js';

const processRepo = new ProcessRepository();
const stepRepo = new StepRepository();

export function registerEvents(app) {
  // Respond to @mentions with status info
  app.event('app_mention', async ({ event, client, say }) => {
    const text = event.text.toLowerCase();

    if (text.includes('status') || text.includes('estado')) {
      const active = [
        ...processRepo.findByStatus('pending'),
        ...processRepo.findByStatus('in_progress'),
      ];

      if (active.length === 0) {
        await say({ text: 'No hay procesos activos de onboarding/offboarding en este momento.' });
        return;
      }

      const lines = active.map((p) => {
        const steps = stepRepo.findAllForProcess(p.id);
        const done = steps.filter((s) => s.status === 'completed').length;
        const emoji = p.process_type === 'onboarding' ? ':green_heart:' : ':wave:';
        return `${emoji} *${p.employee_name}* — ${p.process_type} | ${done}/${steps.length} steps | #${p.id}`;
      });

      await say({
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Procesos activos (${active.length}):*\n\n${lines.join('\n')}\n\nUsa \`/onboard\` o \`/offboard\` para iniciar un nuevo proceso.`,
            },
          },
        ],
        text: `${active.length} procesos activos`,
      });
      return;
    }

    // Default help message
    await say({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: [
              ':wave: Hola! Soy el bot de *Onboarding & Offboarding*.',
              '',
              '*Comandos disponibles:*',
              '• `/onboard` — Iniciar proceso de onboarding para un nuevo empleado',
              '• `/offboard` — Iniciar proceso de offboarding para un empleado',
              '• `/hr-status` — Ver procesos activos',
              '',
              'También puedes mencionarme con `@bot status` para ver los procesos activos.',
            ].join('\n'),
          },
        },
      ],
      text: 'Bot de Onboarding & Offboarding',
    });
  });
}
