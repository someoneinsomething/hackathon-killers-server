import * as config from 'config';

const serverConfig = config.get('SERVER');

export const ApiEntities = [];

export const ServerConfig = {
  port: serverConfig.PORT,
};
