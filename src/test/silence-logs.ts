// Fichier de configuration pour supprimer les logs pendant les tests
import { Logger } from '@nestjs/common';

// Supprimer tous les logs pendant les tests
jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'verbose').mockImplementation(() => {});

// Supprimer les logs de console
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Supprimer les logs de process.stderr
process.stderr.write = jest.fn();
process.stdout.write = jest.fn();



