import S from 'fluent-json-schema';

// Define the schema of a client
export const client = S.object()
  .additionalProperties(false)
  .prop('id', S.string().format('uuid').required())
  .prop('username', S.string().required())
  .prop('proxy', S.string().format('url').required());

export function connect() {}
export function disconnect() {}
