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
  "email",
  "text",
  "radio",
  "checkbox",
  "multicheckbox",
  "textarea",
  "select",
  "date",
  "file",
  "number",
  "video",
  "image",
  "heading",
  "subheading",
] as const;

const inputFieldTypes = [
  "text",
  "radio",
  "checkbox",
  "multicheckbox",
  "textarea",
  "select",
  "date",
  "number",
  "file",
];
const presentationalFieldTypes = ["heading", "subheading", "image", "video"];
const optionFieldTypes = ["radio", "multicheckbox", "select"];

const fieldSchema = Joi.object({
  type: Joi.string()
    .valid(...allowedFieldTypes)
    .required()
    .label("Field Type"),
  name: Joi.string()
    .pattern(/^[a-zA-Z0-9_]+$/)
    .label("Field Name (alphanumeric/underscore)")
    .when("type", {
      is: Joi.valid(...inputFieldTypes),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  label: Joi.string()
    .label("Field Label")
    .when("type", {
      is: Joi.valid("image", "video"),
      then: Joi.optional().allow(null, ""),
      otherwise: Joi.required(),
    }),
  required: Joi.boolean()
    .label("Is Required")
    .when("type", {
      is: Joi.valid(...inputFieldTypes),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  options: Joi.array()
    .items(optionSchema)
    .min(1)
    .label("Field Options")
    .when("type", {
      is: Joi.valid(...optionFieldTypes),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  helperText: Joi.string().allow(null, "").label("Helper Text"),
  accept: Joi.string()
    .allow(null, "")
    .label("Accepted File Types (MIME)")
    .when("type", { is: "file", then: Joi.optional(), otherwise: Joi.forbidden() }),
  multiple: Joi.boolean()
    .label("Allow Multiple Files")
    .when("type", { is: "file", then: Joi.optional(), otherwise: Joi.forbidden() }),
  src: Joi.string()
    .uri()
    .label("Media Source URL")
    .when("type", {
      is: Joi.valid("image", "video"),
      then: Joi.required(),
      otherwise: Joi.forbidden(),
    }),
  alt: Joi.string()
    .allow(null, "")
    .label("Image Alt Text")
    .when("type", { is: "image", then: Joi.optional(), otherwise: Joi.forbidden() }),
  width: Joi.string()
    .allow(null, "")
    .label("Media Width (e.g., '100px', '50%')")
    .when("type", {
      is: Joi.valid("image", "video"),
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  height: Joi.string()
    .allow(null, "")
    .label("Media Height (e.g., '150px', 'auto')")
    .when("type", {
      is: Joi.valid("image", "video"),
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  className: Joi.string()
    .allow(null, "")
    .label("CSS Class Name")
    .when("type", {
      is: Joi.valid("image", "video"),
      then: Joi.optional(),
      otherwise: Joi.forbidden(),
    }),
  controls: Joi.boolean()
    .label("Show Video Controls")
    .when("type", { is: "video", then: Joi.optional(), otherwise: Joi.forbidden() }),
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
