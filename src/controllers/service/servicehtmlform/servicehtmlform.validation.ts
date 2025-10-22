import Joi from "joi";

export const findAllServiceHtmlFormsSchema = Joi.object({
  limit: Joi.number().integer().min(1).default(10).label("Limit"),
  offset: Joi.number().integer().min(0).default(0).label("Offset"),
  service_id: Joi.number().integer().label("Service ID Filter"),
  version: Joi.number().integer().label("Version Filter"),
  sort: Joi.string()
    .trim()
    .pattern(/^([a-zA-Z0-9_]+):(asc|desc)$/i)
    .label("Sort (column:direction)"),
});

export const serviceHtmlFormIdSchema = Joi.object({
  id: Joi.number().integer().required().label("Service ID"),
});

const optionSchema = Joi.object({
  value: Joi.string().required().label("Option Value"),
  label: Joi.string().required().label("Option Label"),
});

const allowedFieldTypes = [
  "text",
  "radio",
  "checkbox",
  "multicheckbox",
  "textarea",
  "select",
  "date",
  "number",
] as const;

const fieldSchema = Joi.object({
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .required()
    .label("Field Name (alphanumeric/underscore)"),
  label: Joi.string().required().label("Field Label"),
  type: Joi.string()
    .valid(...allowedFieldTypes)
    .required()
    .label("Field Type"),
  required: Joi.boolean().required().label("Is Required"),
  options: Joi.array()
    .items(optionSchema)
    .min(1)
    .when("type", {
      is: Joi.valid("radio", "multicheckbox", "select"),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    })
    .label("Field Options"),
});

export const createOrUpdateServiceHtmlFormSchema = Joi.object({
  schema: Joi.object({
    fields: Joi.array().items(fieldSchema).min(1).required().label("Form Fields Array"),
  })
    .required()
    .label("Form Schema JSON"),
  version: Joi.number().integer().min(1).required().label("Schema Version"),
});

export const deleteVersionParamsSchema = Joi.object({
  id: Joi.number().integer().required(),
  version: Joi.number().integer().required(),
});
