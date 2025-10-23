import Joi from "joi";
const serviceStatuses = ["DRAFT", "REVIEW", "PUBLISH"] as const;

export const findAllServicesForDashboardSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  search: Joi.string().trim().allow("").label("Search term (by name or slug)"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
  withFees: Joi.boolean().default(false).label("Include Fee Services Data"),
});

export const serviceSlugSchema = Joi.object({
  slug: Joi.string().required().label("Service Slug"),
});

export const createServiceSchema = Joi.object({
  name: Joi.string().max(200).required().label("Service Name"),
  slug: Joi.string().max(200).required().label("Slug (unique)"),
  price: Joi.number().precision(2).positive().allow(0).required().label("Price"),
  is_fixed_price: Joi.boolean().default(true).label("Is Fixed Price"),
  is_location_required: Joi.boolean().default(false).label("Is Location Required"),
  description: Joi.string().allow(null, "").label("Description"),
  is_public: Joi.boolean().default(true).label("Is Public"),
  image: Joi.string().allow(null, "").label("Image URL"),
  status: Joi.string()
    .valid(...serviceStatuses)
    .default("DRAFT")
    .label("Status"),
});

export const updateServiceSchema = Joi.object({
  name: Joi.string().max(200).label("Service Name"),
  slug: Joi.string().max(200).label("Slug (unique)"),
  price: Joi.number().precision(2).positive().allow(0).label("Price"),
  is_fixed_price: Joi.boolean().label("Is Fixed Price"),
  is_location_required: Joi.boolean().label("Is Location Required"),
  description: Joi.string().allow(null, "").label("Description"),
  is_public: Joi.boolean().label("Is Public"),
  image: Joi.string().allow(null, "").label("Image URL"),
  status: Joi.string()
    .valid(...serviceStatuses)
    .label("Status"),
})
  .min(1)
  .label("Update Service Data");
