import Joi from "joi";

export const findAllTokenScopesSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  access_token_id: Joi.string().uuid().label("Access Token ID (UUID) Filter"),
  api_scope_id: Joi.number().integer().label("API Scope ID Filter"),
});

export const createTokenScopeSchema = Joi.object({
  access_token_id: Joi.string().uuid().required().label("Access Token ID (UUID)"),
  api_scope_id: Joi.number().integer().required().label("API Scope ID"),
});

export const deleteTokenScopeParamsSchema = Joi.object({
  access_token_id: Joi.string().uuid().required().label("Access Token ID (UUID)"),
  api_scope_id: Joi.number().integer().required().label("API Scope ID"),
});
