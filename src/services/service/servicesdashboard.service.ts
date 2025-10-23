import { service, common } from "@jumpapay/jumpapay-models";
import { NotFoundError, BadRequestError } from "@utils/errors";
import { Page, QueryBuilder, Transaction } from "objection";
import { ServicesService } from "./services.service";

interface FindAllOptions {
  limit: number;
  offset: number;
  search?: string;
  sort?: string;
  withFees?: boolean;
}

export class ServicesDashboard extends ServicesService {
  async findAll({
    limit,
    offset,
    search,
    sort,
    withFees,
  }: FindAllOptions): Promise<Page<service.Services>> {
    let query = service.Services.query()
      .select(
        `${service.Services.tableName}.id`,
        `${service.Services.tableName}.name`,
        `${service.Services.tableName}.slug`,
        `${service.Services.tableName}.price`,
        `${service.Services.tableName}.is_fixed_price`,
        `${service.Services.tableName}.is_location_required`,
        `${service.Services.tableName}.description`,
        `${service.Services.tableName}.image`,
      )
      .where(`${service.Services.tableName}.status`, "PUBLISH")
      .whereNull(`${service.Services.tableName}.deleted_at`);

    if (search) {
      query = query.where((builder) => {
        builder
          .where(`${service.Services.tableName}.name`, "ilike", `%${search}%`)
          .orWhere(`${service.Services.tableName}.slug`, "ilike", `%${search}%`);
      });
    }

    if (sort) {
      const [column, direction] = sort.split(":");
      const allowedSortColumns = [
        "id",
        "name",
        "slug",
        "price",
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
    eagerGraph.htmlForm = true;

    if (Object.keys(eagerGraph).length > 0) {
      query = query.withGraphFetched(eagerGraph);
    }

    const page = Math.floor(offset / limit);
    const servicesPage: Page<service.Services> = await query.page(page, limit);
    return servicesPage;
  }
}

export default new ServicesDashboard();
