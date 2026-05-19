/**
 * Repository factory — devuelve la implementación correcta según DB_TYPE.
 * Uso:
 *   import { getProcessRepo, getStepRepo } from './repositories/index.js';
 *   const repo = getProcessRepo();
 *   const process = await repo.create(data);
 */
import { appConfig } from '../config/index.js';

let _processRepo = null;
let _stepRepo    = null;

export async function getProcessRepo() {
  if (_processRepo) return _processRepo;

  if (appConfig.db.type === 'mysql') {
    const { ProcessRepositoryMySQL } = await import('./ProcessRepositoryMySQL.js');
    _processRepo = new ProcessRepositoryMySQL();
  } else {
    const { ProcessRepository } = await import('./ProcessRepository.js');
    _processRepo = new ProcessRepository();
  }

  return _processRepo;
}

export async function getStepRepo() {
  if (_stepRepo) return _stepRepo;

  if (appConfig.db.type === 'mysql') {
    const { StepRepositoryMySQL } = await import('./StepRepositoryMySQL.js');
    _stepRepo = new StepRepositoryMySQL();
  } else {
    const { StepRepository } = await import('./StepRepository.js');
    _stepRepo = new StepRepository();
  }

  return _stepRepo;
}
