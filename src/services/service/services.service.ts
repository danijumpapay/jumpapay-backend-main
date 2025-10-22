import { service, common } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "../../utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";

type ServiceStatusValue = "DRAFT" | "REVIEW" | "PUBLISH";

type CreateServiceInput = Omit<service.Services, "id" | "created_at" | "deleted_at">;
type UpdateServiceInput = Partial<CreateServiceInput>;
type ServiceRelationParams = { withFees?: boolean };

interface FindAllServicesOptions {
  limit: number;
  offset: number;
  search?: string;
  slug?: string;
  is_public?: boolean;
  is_fixed_price?: boolean;
  is_location_required?: boolean;
  status?: ServiceStatusValue;
  sort?: string;
  withFees?: boolean;
}

export class ServicesService {
  async findAll({
    limit,
    offset,
    search,
    slug,
    is_public,
    is_fixed_price,
    is_location_required,
    status,
    sort,
    withFees,
  }: FindAllServicesOptions): Promise<Page<service.Services>> {
    let query = service.Services.query().whereNull("deleted_at");

    if (search) {
      query = query.where((builder) => {
        builder
          .where(`${service.Services.tableName}.name`, "ilike", `%${search}%`)
          .orWhere(`${service.Services.tableName}.slug`, "ilike", `%${search}%`);
      });
    }
    if (slug) query = query.where("slug", slug);
    if (typeof is_public === "boolean") query = query.where("is_public", is_public);
    if (typeof is_fixed_price === "boolean") query = query.where("is_fixed_price", is_fixed_price);
    if (typeof is_location_required === "boolean")
      query = query.where("is_location_required", is_location_required);
    if (status) query = query.where("status", status);

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "name",
        "slug",
        "price",
        "is_public",
        "status",
        "created_at",
      ];
      const sortColumn = allowedSortColumns.includes(column)
        ? `${service.Services.tableName}.${column}`
        : `${service.Services.tableName}.name`;
      if (["asc", "desc"].includes(direction.toLowerCase())) {
        query = query.orderBy(sortColumn, direction.toUpperCase() as "ASC" | "DESC");
      }
    } else {
      query = query.orderBy(`${service.Services.tableName}.name`, "ASC");
    }

    const eagerGraph: Record<string, any> = {};
    if (withFees) {
      eagerGraph.jumpapayFees = {
        feeServiceDetails: {
          $relation: "serviceFees",
          $modify: ["selectJoinTableData"],
        },
        $modify: ["selectFeeDetails", "activeOnlyFee"],
      };
    }

    const modifiers = {
      selectFeeDetails: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select(
            `${common.JumpapayFees.tableName}.id`,
            `${common.JumpapayFees.tableName}.name`,
            `${common.JumpapayFees.tableName}.code`,
            `${common.JumpapayFees.tableName}.jumpapay_fee_group_id`
          )
          .withGraphFetched("group(selectGroupName)")
          .modifiers({
            selectGroupName: (groupBuilder: QueryBuilder<common.JumpapayFeeGroups>) => {
              groupBuilder
                .select(
                  `${common.JumpapayFeeGroups.tableName}.id`,
                  `${common.JumpapayFeeGroups.tableName}.name`
                )
                .whereNull(`${common.JumpapayFeeGroups.tableName}.deleted_at`);
            },
          });
      },
      activeOnlyFee: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .whereNull(`${common.JumpapayFees.tableName}.deleted_at`)
          .where(`${common.JumpapayFees.tableName}.is_active`, true);
      },
      selectJoinTableData: (builder: QueryBuilder<common.JumpapayFeeServices>) => {
        builder
          .select(
            `${common.JumpapayFeeServices.tableName}.type`,
            `${common.JumpapayFeeServices.tableName}.value`,
            `${common.JumpapayFeeServices.tableName}.formula`,
            `${common.JumpapayFeeServices.tableName}.is_active`,
            `${common.JumpapayFeeServices.tableName}.order_fee_name`,
            `${common.JumpapayFeeServices.tableName}.order_fee_group`
          )

          .where(`${common.JumpapayFeeServices.tableName}.is_active`, true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const page = Math.floor(offset / limit);
    const servicesPage: Page<service.Services> = await query.page(page, limit);
    return servicesPage;
  }

  async findOne(id: number, { withFees }: ServiceRelationParams = {}): Promise<service.Services> {
    let query = service.Services.query().findById(id).whereNull("deleted_at");

    const eagerGraph: Record<string, any> = {};
    if (withFees) {
      eagerGraph.jumpapayFees = {
        feeServiceDetails: {
          $relation: "serviceFees",
          $modify: ["selectJoinTableData"],
        },
        $modify: ["selectFeeDetails", "activeOnlyFee"],
      };
    }

    const modifiers = {
      selectFeeDetails: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .select(
            `${common.JumpapayFees.tableName}.id`,
            `${common.JumpapayFees.tableName}.name`,
            `${common.JumpapayFees.tableName}.code`,
            `${common.JumpapayFees.tableName}.jumpapay_fee_group_id`
          )
          .withGraphFetched("group(selectGroupName)")
          .modifiers({
            selectGroupName: (groupBuilder: QueryBuilder<common.JumpapayFeeGroups>) => {
              groupBuilder
                .select(
                  `${common.JumpapayFeeGroups.tableName}.id`,
                  `${common.JumpapayFeeGroups.tableName}.name`
                )
                .whereNull(`${common.JumpapayFeeGroups.tableName}.deleted_at`);
            },
          });
      },
      activeOnlyFee: (builder: QueryBuilder<common.JumpapayFees>) => {
        builder
          .whereNull(`${common.JumpapayFees.tableName}.deleted_at`)
          .where(`${common.JumpapayFees.tableName}.is_active`, true);
      },
      selectJoinTableData: (builder: QueryBuilder<common.JumpapayFeeServices>) => {
        builder
          .select(
            `${common.JumpapayFeeServices.tableName}.type`,
            `${common.JumpapayFeeServices.tableName}.value`,
            `${common.JumpapayFeeServices.tableName}.formula`,
            `${common.JumpapayFeeServices.tableName}.is_active`,
            `${common.JumpapayFeeServices.tableName}.order_fee_name`,
            `${common.JumpapayFeeServices.tableName}.order_fee_group`
          )
          .where(`${common.JumpapayFeeServices.tableName}.is_active`, true);
      },
    };

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph).modifiers(modifiers);
    }

    const svc = await query;
    if (!svc) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }
    return svc;
  }

  async create(data: CreateServiceInput, trx?: Transaction): Promise<service.Services> {
    const slugExists = await service.Services.query(trx)
      .findOne({ slug: data.slug })
      .whereNull("deleted_at");
    if (slugExists) {
      throw new BadRequestError(`Service with slug "${data.slug}" already exists.`);
    }

    const newService = await service.Services.query(trx).insert(data).returning("*");
    return Array.isArray(newService) ? newService[0] : newService;
  }

  async update(id: number, data: UpdateServiceInput, trx?: Transaction): Promise<service.Services> {
    const svc = await service.Services.query(trx).findById(id).whereNull("deleted_at");
    if (!svc) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }

    if (data.slug && data.slug !== svc.slug) {
      const slugExists = await service.Services.query(trx)
        .findOne({ slug: data.slug })
        .whereNull("deleted_at")
        .whereNot("id", id);
      if (slugExists) {
        throw new BadRequestError(`Service with slug "${data.slug}" already exists.`);
      }
    }

    const updatedServices = await svc.$query(trx).patch(data).returning("*");
    return Array.isArray(updatedServices) ? updatedServices[0] : updatedServices;
  }

  async remove(id: number, trx?: Transaction): Promise<{ message: string }> {
    const svc = await service.Services.query(trx).findById(id).whereNull("deleted_at");
    if (!svc) {
      throw new NotFoundError(`Service with ID ${id} not found`);
    }
    await svc.$query(trx).patch({ deleted_at: new Date().toISOString() });
    return { message: `Service with ID ${id} deleted successfully` };
  }
}

export default new ServicesService();
