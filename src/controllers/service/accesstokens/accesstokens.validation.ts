import Joi from "joi";
const tokenStatuses = ["ACTIVE", "REVOKED", "EXPIRED"] as const;

export const findAllAccessTokensSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  company_id: Joi.string().max(200).label("Company ID Filter"),
  user_id: Joi.string().max(200).label("User ID Filter"),
  status: Joi.string()
    .valid(...tokenStatuses)
    .label("Token Status Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withScopes: Joi.boolean().default(false).label("Include Scopes Data"),
  withUser: Joi.boolean().default(false).label("Include User Data"),
  withCompany: Joi.boolean().default(false).label("Include Company Data"),
});

export const accessTokenIdSchema = Joi.object({
  id: Joi.string().uuid().required().label("Access Token ID (UUID)"),
});

export const createAccessTokenSchema = Joi.object({
  company_id: Joi.string().max(200).allow(null).label("Associated Company ID"),
  user_id: Joi.string().max(200).allow(null).label("Associated User ID"),

  expired_at: Joi.date().iso().allow(null).label("Expiration Timestamp (ISO 8601)"),

  api_scope_ids: Joi.array().items(Joi.number().integer()).min(1).label("API Scope IDs"),
}).or("company_id", "user_id");

export const updateAccessTokenSchema = Joi.object({
  status: Joi.string()
    .valid(...tokenStatuses)
    .label("New Status"),
  expired_at: Joi.date().iso().allow(null).label("New Expiration Timestamp (ISO 8601)"),
})
  .min(1)
  .label("Update Access Token Data");
